import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import ExcelJS from 'exceljs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // ==========================================
    // 1. TANGKAP FILTER & MODE
    // ==========================================
    // Mode: 'history' (Riwayat Diklat) atau 'kandidat' (Data PTK/Sasaran)
    const mode = searchParams.get('mode_filter') || 'history'; 

    const search = searchParams.get('search') || '';
    const sekolah = searchParams.get('sekolah') || '';
    const jenjang = searchParams.get('jenjang') || '';
    // Status (Sudah/Belum) kita override nanti berdasarkan mode
    
    // Wilayah
    const kabupaten = searchParams.get('kabupaten') || '';
    const kabupatenArray = kabupaten ? kabupaten.split(',') : [];
    const kecamatan = searchParams.get('kecamatan') || ''; 
    const kecamatanArray = kecamatan ? kecamatan.split(',') : [];

    // Filter Diklat (Hanya relevan untuk mode HISTORY)
    const judulDiklat = searchParams.get('judul_diklat');
    const rumpunId = searchParams.get('rumpun');
    const subRumpunId = searchParams.get('sub_rumpun');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // ==========================================
    // 2. BASE QUERY
    // ==========================================
    let baseQuery = `
      SELECT 
        mv.nama_ptk, mv.nik, mv.nuptk, mv.nip, mv.jenis_kelamin, mv.tanggal_lahir,
        mv.nama_sekolah, mv.npsn_sekolah, mv.bentuk_pendidikan as jenjang,
        mv.kecamatan, mv.kabupaten, mv.no_hp,
        mv.jenis_ptk, mv.jabatan_ptk, 
        mv.riwayat_pend_jenjang as pendidikan, mv.riwayat_pend_bidang, mv.riwayat_sertifikasi,
        mv.status_kepegawaian, mv.pangkat_golongan,
        
        -- Data Diklat (Bisa NULL jika kandidat)
        mv.judul_diklat, mv.total_jp, mv.start_date, mv.end_date, mv.moda_diklat,
        mv.is_sudah_pelatihan
      FROM mv_dashboard_analitik mv 
      WHERE 1=1
    `;
    
    const values = [];
    let counter = 1;

    // ==========================================
    // 3. LOGIC FILTER BERDASARKAN MODE
    // ==========================================
    
    // --- A. FILTER UMUM (Berlaku untuk History & Kandidat) ---
    // Filter atribut melekat pada PTK (Nama, Sekolah, Wilayah)
    
    if (search) {
      baseQuery += ` AND (mv.nama_ptk ILIKE $${counter} OR mv.nik ILIKE $${counter})`;
      values.push(`%${search}%`); 
      counter++;
    }

    if (sekolah) {
      baseQuery += ` AND mv.nama_sekolah ILIKE $${counter}`;
      values.push(`%${sekolah}%`); 
      counter++;
    }

    if (jenjang && jenjang !== 'ALL') {
      baseQuery += ` AND mv.bentuk_pendidikan = $${counter}`;
      values.push(jenjang); 
      counter++;
    }

    if (kabupatenArray.length > 0) {
       const placeholders = kabupatenArray.map((_, i) => `$${counter + i}`).join(',');
       baseQuery += ` AND UPPER(mv.kabupaten) IN (${placeholders})`;
       kabupatenArray.forEach(k => values.push(k.toUpperCase())); 
       counter += kabupatenArray.length;
    }

    if (kecamatanArray.length > 0) {
       const placeholders = kecamatanArray.map((_, i) => `$${counter + i}`).join(',');
       baseQuery += ` AND UPPER(mv.kecamatan) IN (${placeholders})`;
       kecamatanArray.forEach(k => values.push(k.toUpperCase())); 
       counter += kecamatanArray.length;
    }

    // --- B. FILTER KHUSUS MODE ---
    
    if (mode === 'history') {
        // === MODE HISTORY ===
        // Menampilkan data pelatihannya. Wajib sudah pelatihan.
        // Filter Judul/Tanggal/Rumpun BERLAKU di sini.
        
        baseQuery += ` AND mv.is_sudah_pelatihan = TRUE`;

        if (startDate && endDate) {
            baseQuery += ` AND mv.start_date >= $${counter} AND mv.end_date <= $${counter + 1}`;
            values.push(startDate, endDate); 
            counter += 2;
        }

        if (rumpunId && rumpunId !== 'ALL') {
            baseQuery += ` AND mv.rumpun_id = $${counter}`;
            values.push(rumpunId); 
            counter++;
        }
        
        if (subRumpunId && subRumpunId !== 'ALL') {
            baseQuery += ` AND mv.sub_topic_id = $${counter}`;
            values.push(subRumpunId); 
            counter++;
        }

        if (judulDiklat) {
            baseQuery += ` AND mv.judul_diklat ILIKE $${counter}`;
            values.push(`%${judulDiklat}%`); 
            counter++;
        }

        // Sort History: Berdasarkan tanggal pelatihan terbaru
        baseQuery += ` ORDER BY mv.start_date DESC, mv.nama_ptk ASC`;

    } else {
        // === MODE KANDIDAT ===
        // Menampilkan Master PTK yang BELUM ikut pelatihan (atau semua PTK unik).
        // PENTING: Jangan filter by 'judul_diklat' atau 'start_date' karena data kandidat pasti NULL.
        
        // Memastikan yang diambil adalah record master/belum pelatihan
        baseQuery += ` AND (mv.is_sudah_pelatihan = FALSE OR mv.is_sudah_pelatihan IS NULL)`;

        // Sort Kandidat: Berdasarkan Nama atau Sekolah
        baseQuery += ` ORDER BY mv.nama_sekolah ASC, mv.nama_ptk ASC`;
    }

    // ==========================================
    // 4. EKSEKUSI & GENERATE EXCEL
    // ==========================================
    const res = await pool.query(baseQuery, values);
    const rows = res.rows;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(mode === 'history' ? 'Riwayat Diklat' : 'Data Kandidat PTK');

    // Kolom Dasar PTK
    const columns = [
      { header: 'Nama', key: 'nama_ptk', width: 30 },
      { header: 'NIK', key: 'nik', width: 20 },
      { header: 'NUPTK', key: 'nuptk', width: 20 },
      { header: 'NIP', key: 'nip', width: 20 },
      { header: 'L/P', key: 'jenis_kelamin', width: 5 },
      { header: 'Tempat Tugas', key: 'nama_sekolah', width: 30 },
      { header: 'NPSN', key: 'npsn_sekolah', width: 12 },
      { header: 'Jenjang', key: 'jenjang', width: 10 },
      { header: 'Kecamatan', key: 'kecamatan', width: 15 },
      { header: 'Kabupaten/Kota', key: 'kabupaten', width: 15 },
      { header: 'Nomor HP', key: 'no_hp', width: 15 },
      { header: 'Jenis PTK', key: 'jenis_ptk', width: 15 },
      { header: 'Jabatan PTK', key: 'jabatan_ptk', width: 15 },
      { header: 'Pendidikan', key: 'pendidikan', width: 10 },
      { header: 'Bidang Studi', key: 'riwayat_pend_bidang', width: 20 },
      { header: 'Status', key: 'status_kepegawaian', width: 15 },
      { header: 'Golongan', key: 'pangkat_golongan', width: 10 },
    ];

    // Jika Mode History, tambah kolom Diklat
    if (mode === 'history') {
        columns.push(
            { header: 'Nama Kegiatan', key: 'judul_diklat', width: 40 },
            { header: 'Lama (Hari/JP)', key: 'lama_kegiatan', width: 15 },
            { header: 'Tgl Mulai', key: 'start_date', width: 15 },
            { header: 'Tgl Selesai', key: 'end_date', width: 15 },
            { header: 'Moda', key: 'moda_diklat', width: 15 }
        );
    }

    worksheet.columns = columns;

    rows.forEach(row => {
        // Hitung Lama Kegiatan (Hanya untuk History)
        let lamaKegiatan = '-';
        if (mode === 'history') {
            if (row.start_date && row.end_date) {
                const start = new Date(row.start_date);
                const end = new Date(row.end_date);
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
                lamaKegiatan = `${diffDays} Hari`;
            } else if (row.total_jp) {
                lamaKegiatan = `${row.total_jp} JP`;
            }
        }

        const rowData = {
            ...row,
            // Format Tanggal untuk Excel (agar dikenali sebagai date)
            start_date: row.start_date ? new Date(row.start_date) : null,
            end_date: row.end_date ? new Date(row.end_date) : null,
            
            // Clean Null Values
            nuptk: row.nuptk || '-',
            nip: row.nip || '-',
            no_hp: row.no_hp || '-',
            riwayat_pend_bidang: row.riwayat_pend_bidang || '-',
        };

        if (mode === 'history') {
            rowData.lama_kegiatan = lamaKegiatan;
            rowData.judul_diklat = row.judul_diklat || '-';
        }

        worksheet.addRow(rowData);
    });

    // Styling Header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: mode === 'history' ? 'FF1F4E78' : 'FF2E7D32' } // Biru (History), Hijau (Kandidat)
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    
    // AutoFilter
    const lastColChar = String.fromCharCode(65 + columns.length - 1); // Hitung huruf kolom terakhir
    worksheet.autoFilter = { from: 'A1', to: `${lastColChar}1` };

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = mode === 'history' ? 'Laporan_Riwayat_Diklat.xlsx' : 'Data_Kandidat_PTK.xlsx';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error("Error Export Excel:", error);
    return NextResponse.json({ error: 'Gagal export data' }, { status: 500 });
  }
}