import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    // 1. Terima parameter peserta DAN diklatId (untuk cek duplikat)
    const { peserta, diklatId } = await request.json(); 
    
    if (!peserta || peserta.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Ambil list NIK dan NPSN dari Excel untuk query bulk
    const nikList = peserta.map(p => String(p.NIK)).filter(n => n);
    const npsnList = peserta.map(p => String(p.NPSN)).filter(n => n);
    
    if (nikList.length === 0) {
       return NextResponse.json({ error: "Tidak ada NIK ditemukan dalam file" }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
        // A. Ambil Data PTK berdasarkan NIK
        const queryPTK = `
            SELECT nik, nama_ptk, npsn, jabatan_ptk, pangkat_golongan
            FROM data_ptk 
            WHERE nik = ANY($1)
        `;
        const resPTK = await client.query(queryPTK, [nikList]);
        const foundPTK = resPTK.rows;

        // B. Ambil Data Sekolah (Nama) berdasarkan NPSN yang diupload
        const querySekolah = `
            SELECT DISTINCT npsn, nama
            FROM satuan_pendidikan 
            WHERE npsn = ANY($1)
        `;
        const resSekolah = await client.query(querySekolah, [npsnList]);
        const foundSekolah = resSekolah.rows;

        // C. (PENTING) Cek Apakah Sudah Terdaftar di Diklat Ini?
        let registeredNiks = new Set();
        if (diklatId) {
            const enrolledQuery = `
                SELECT nik FROM data_alumni 
                WHERE id_diklat = $1 AND nik = ANY($2)
            `;
            const enrolledRes = await client.query(enrolledQuery, [diklatId, nikList]);
            enrolledRes.rows.forEach(row => registeredNiks.add(row.nik));
        }

        // D. Proses Validasi Per Baris
        const validatedData = peserta.map(p => {
            const excelNpsn = String(p.NPSN || "").trim();
            const excelNik = String(p.NIK || "").trim();
            
            // Cari data di hasil query DB
            const matchPTK = foundPTK.find(db => db.nik === excelNik);
            const matchSekolah = foundSekolah.find(s => s.npsn === excelNpsn);

            let isValid = true;
            let status_msg = "Valid";
            let suggestions = {};
            let nama_sekolah_display = matchSekolah ? matchSekolah.nama : "NPSN Tidak Ditemukan";

            // LOGIC VALIDASI BERLAPIS

            // 1. Cek Duplikasi (Prioritas Utama)
            if (registeredNiks.has(excelNik)) {
                isValid = false;
                status_msg = "Sudah Terdaftar di Diklat ini";
            }
            // 2. Cek Apakah NIK Ada di Master PTK
            else if (!matchPTK) {
                isValid = false;
                status_msg = "NIK Tidak Terdaftar di Database";
            } 
            else {
                // 3. Cek Kesesuaian Nama (Hanya warning/suggestion)
                if (p.Nama && matchPTK.nama_ptk && matchPTK.nama_ptk.trim().toLowerCase() !== p.Nama.trim().toLowerCase()) {
                    suggestions.nama_db = matchPTK.nama_ptk;
                }

                // 4. Cek Mutasi Sekolah (Info saja, tidak invalid)
                // Jika NPSN di excel beda dengan NPSN di data PTK, mungkin dia baru pindah
                if (matchPTK.npsn !== excelNpsn) {
                    status_msg = `Info: Mutasi (DB: ${matchPTK.npsn || '-'})`;
                }
                
                // 5. Cek Validitas NPSN Sekolah Tujuan
                if (!matchSekolah) {
                    isValid = false; 
                    status_msg = "NPSN Tidak Valid";
                    nama_sekolah_display = "-";
                }
            }

            return {
                ...p,
                isValid,
                status_msg,
                ...suggestions,
                sekolah_auto: nama_sekolah_display, // Nama sekolah otomatis dari DB
                db_data: matchPTK ? { 
                    nama: matchPTK.nama_ptk, 
                    jabatan: matchPTK.jabatan_ptk, 
                    golongan: matchPTK.pangkat_golongan, 
                    npsn: matchPTK.npsn, 
                    sekolah: matchSekolah ? matchSekolah.nama : null 
                } : null
            };
        });

        return NextResponse.json({ data: validatedData });

    } finally {
        client.release();
    }

  } catch (error) {
    console.error("Error Validation:", error);
    return NextResponse.json({ error: 'Gagal memvalidasi data' }, { status: 500 });
  }
}