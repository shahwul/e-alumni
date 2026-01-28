import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { peserta } = await request.json(); 
    
    if (!peserta || peserta.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Ambil list NIK dan NPSN dari Excel untuk query
    const nikList = peserta.map(p => String(p.NIK)).filter(n => n);
    const npsnList = peserta.map(p => String(p.NPSN)).filter(n => n);
    
    if (nikList.length === 0) {
       return NextResponse.json({ error: "Tidak ada NIK ditemukan" }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
        // 1. Ambil Data PTK berdasarkan NIK
        const queryPTK = `
            SELECT nik, nama_ptk, npsn_sekolah
            FROM mv_dashboard_analitik 
            WHERE nik = ANY($1)
        `;
        const resPTK = await client.query(queryPTK, [nikList]);
        const foundPTK = resPTK.rows;

        // 2. Ambil Data Sekolah (Nama) berdasarkan NPSN yang diupload
        // (Asumsi ada tabel referensi sekolah, atau kita ambil distinct dari mv_dashboard)
        // Kita pakai mv_dashboard_analitik saja biar simpel, ambil nama sekolah dari npsn itu
        const querySekolah = `
            SELECT DISTINCT npsn, nama
            FROM satuan_pendidikan 
            WHERE npsn = ANY($1)
        `;
        const resSekolah = await client.query(querySekolah, [npsnList]);
        const foundSekolah = resSekolah.rows;

        const validatedData = peserta.map(p => {
            const excelNpsn = String(p.NPSN || "").trim();
            const excelNik = String(p.NIK || "").trim();
            
            // Cek NIK di DB
            const matchPTK = foundPTK.find(db => db.nik === excelNik);
            
            // Cek Nama Sekolah dari NPSN yang diupload
            const matchSekolah = foundSekolah.find(s => s.npsn === excelNpsn);

            let isValid = true;
            let status_msg = "Valid";
            let suggestions = {};
            let nama_sekolah_display = matchSekolah ? matchSekolah.nama : "NPSN Tidak Ditemukan";

            console.log("Match:", matchPTK);

            if (!matchPTK) {
                isValid = false;
                status_msg = "NIK Tidak Terdaftar";
            } else {
                // Cek Nama Orang
                if (p.Nama && matchPTK.nama_ptk.trim().toLowerCase() !== p.Nama.trim().toLowerCase()) {
                    suggestions.nama_db = matchPTK.nama_ptk;
                }

                // Cek apakah PTK ini mutasi? (NPSN excel beda dengan NPSN dia di DB)
                if (matchPTK.npsn_sekolah !== excelNpsn) {
                    status_msg = `Info: Mutasi (DB: ${matchPTK.npsn_sekolah})`;
                    // Tetap valid, karena mungkin dia baru pindah dan belum update dapodik
                }
                
                if (!matchSekolah) {
                    isValid = false; // NPSN ngawur/typo
                    status_msg = "NPSN Tidak Valid";
                    nama_sekolah_display = "-";
                }
            }

            return {
                ...p,
                isValid,
                status_msg,
                ...suggestions,
                sekolah_auto: nama_sekolah_display, // Ini hasil lookup otomatis
                db_data: matchPTK ? { nama: matchPTK.nama_ptk } : null
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