import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import ExcelJS from 'exceljs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // ==========================================
    // 1. TANGKAP SEMUA FILTER DARI FRONTEND
    // ==========================================
    const search = searchParams.get('search') || '';
    const sekolah = searchParams.get('sekolah') || '';
    const jenjang = searchParams.get('jenjang') || '';
    const status = searchParams.get('status') || '';
    
    // Wilayah (Array split by comma)
    const kabupaten = searchParams.get('kabupaten') || '';
    const kabupatenArray = kabupaten ? kabupaten.split(',') : [];
    
    const kecamatan = searchParams.get('kecamatan') || ''; 
    const kecamatanArray = kecamatan ? kecamatan.split(',') : [];

    // Filter Diklat
    const judulDiklat = searchParams.get('judul_diklat');
    const rumpunId = searchParams.get('rumpun');
    const subRumpunId = searchParams.get('sub_rumpun');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // ==========================================
    // 2. QUERY TRANSAKSIONAL LENGKAP
    // ==========================================
    // Kita ambil semua kolom sesuai format Excel yang diminta
    let baseQuery = `
      SELECT 
        mv.nama_ptk,
        mv.nik,
        mv.nuptk,
        mv.nip,
        mv.jenis_kelamin,
        mv.tanggal_lahir,
        mv.nama_sekolah,    -- Tempat Tugas
        mv.npsn_sekolah,    -- NPSN
        mv.bentuk_pendidikan as jenjang,
        mv.kecamatan,
        mv.kabupaten,
        mv.no_hp,
        mv.jenis_ptk,
        mv.jabatan_ptk,
        mv.riwayat_pend_jenjang as pendidikan,
        mv.riwayat_pend_bidang,
        mv.riwayat_sertifikasi,
        mv.status_kepegawaian,
        mv.pangkat_golongan,
        -- mv.jabatan_kepsek, 
        
        -- Data Diklat
        mv.judul_diklat,    -- Nama Kegiatan
        mv.total_jp,        -- (Opsional, buat fallback)
        mv.start_date,      -- Tgl Mulai
        mv.end_date,        -- Tgl Berakhir
        mv.moda_diklat,     -- Daring/Luring
        
        mv.is_sudah_pelatihan
      FROM mv_dashboard_analitik mv 
      WHERE 1=1
    `;
    
    const values = [];
    let counter = 1;

    // ==========================================
    // 3. TERAPKAN LOGIC FILTER (WHERE CLAUSE)
    // ==========================================
    
    // A. Search Nama / NIK
    if (search) {
      baseQuery += ` AND (mv.nama_ptk ILIKE $${counter} OR mv.nik ILIKE $${counter})`;
      values.push(`%${search}%`); 
      counter++;
    }

    // B. Sekolah
    if (sekolah) {
      baseQuery += ` AND mv.nama_sekolah ILIKE $${counter}`;
      values.push(`%${sekolah}%`); 
      counter++;
    }

    // C. Jenjang (SD/SMP/dll)
    if (jenjang && jenjang !== 'ALL') {
      baseQuery += ` AND mv.bentuk_pendidikan = $${counter}`;
      values.push(jenjang); 
      counter++;
    }

    // D. Kabupaten (Multi Select)
    if (kabupatenArray.length > 0) {
       const placeholders = kabupatenArray.map((_, i) => `$${counter + i}`).join(',');
       baseQuery += ` AND UPPER(mv.kabupaten) IN (${placeholders})`;
       kabupatenArray.forEach(k => values.push(k.toUpperCase())); 
       counter += kabupatenArray.length;
    }

    // E. Kecamatan (Multi Select)
    if (kecamatanArray.length > 0) {
       const placeholders = kecamatanArray.map((_, i) => `$${counter + i}`).join(',');
       baseQuery += ` AND UPPER(mv.kecamatan) IN (${placeholders})`;
       kecamatanArray.forEach(k => values.push(k.toUpperCase())); 
       counter += kecamatanArray.length;
    }

    // F. Filter Tanggal Diklat
    if (startDate && endDate) {
      baseQuery += ` AND mv.start_date >= $${counter} AND mv.end_date <= $${counter + 1}`;
      values.push(startDate); 
      values.push(endDate); 
      counter += 2;
    }

    // G. Status Pelatihan (Sudah/Belum)
    if (status === 'sudah') {
        baseQuery += ` AND mv.is_sudah_pelatihan = TRUE`;
    } else if (status === 'belum') {
        baseQuery += ` AND mv.is_sudah_pelatihan = FALSE`;
    }

    // H. Filter Rumpun / Topik Diklat
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

    // I. Search Judul Diklat
    if (judulDiklat) {
      baseQuery += ` AND mv.judul_diklat ILIKE $${counter}`;
      values.push(`%${judulDiklat}%`); 
      counter++;
    }

    // Sort biar rapi (Nama A-Z, lalu Tanggal Diklat Terbaru)
    baseQuery += ` ORDER BY mv.nama_ptk ASC, mv.start_date DESC`;

    // Eksekusi Query
    const res = await pool.query(baseQuery, values);
    const rows = res.rows;

    // ==========================================
    // 4. GENERATE EXCEL
    // ==========================================
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Diklat PTK');

    // Definisi Header & Lebar Kolom
    worksheet.columns = [
      { header: 'Nama', key: 'nama_ptk', width: 30 },
      { header: 'NIK', key: 'nik', width: 20 },
      { header: 'NUPTK', key: 'nuptk', width: 20 },
      { header: 'NIP', key: 'nip', width: 20 },
      { header: 'L/P', key: 'jenis_kelamin', width: 5 },
      { header: 'Tanggal Lahir', key: 'tanggal_lahir', width: 15 },
      { header: 'Tempat Tugas', key: 'nama_sekolah', width: 30 },
      { header: 'NPSN', key: 'npsn_sekolah', width: 12 },
      { header: 'Jenjang', key: 'jenjang', width: 10 },
      { header: 'Kecamatan', key: 'kecamatan', width: 15 },
      { header: 'Kabupaten/Kota', key: 'kabupaten', width: 15 },
      { header: 'Nomor HP', key: 'no_hp', width: 15 },
      { header: 'Jenis PTK', key: 'jenis_ptk', width: 15 },
      { header: 'Jabatan PTK', key: 'jabatan_ptk', width: 15 },
      { header: 'Pendidikan', key: 'pendidikan', width: 10 },
      { header: 'Bidang Studi Pendidikan', key: 'riwayat_pend_bidang', width: 20 },
      { header: 'Bidang Studi Sertifikasi', key: 'riwayat_sertifikasi', width: 20 },
      { header: 'Status Kepegawaian', key: 'status_kepegawaian', width: 15 },
      { header: 'Pangkat/Gol', key: 'pangkat_golongan', width: 15 },
      { header: 'Jabatan Kepsek', key: 'jabatan_ptk', width: 15 }, 
      { header: 'Nama Kegiatan/Pelatihan', key: 'judul_diklat', width: 40 },
      { header: 'Lama Kegiatan', key: 'lama_kegiatan', width: 15 }, 
      { header: 'Tanggal Mulai', key: 'start_date', width: 15 },
      { header: 'Tanggal Berakhir', key: 'end_date', width: 15 },
      { header: 'Daring/Luring', key: 'moda_diklat', width: 15 },
    ];

    // Mapping Data Row by Row
    rows.forEach(row => {
        // Hitung Lama Kegiatan (Hari)
        let lamaKegiatan = '-';
        if (row.start_date && row.end_date) {
            const start = new Date(row.start_date);
            const end = new Date(row.end_date);
            const diffTime = end.getTime() - start.getTime();
            const diffDays = Math.round(diffTime / (1000 * 3600 * 24)) + 1; // +1 biar inklusif
            lamaKegiatan = diffDays > 0 ? `${diffDays} Hari` : '1 Hari';
        } else if (row.total_jp) {
            lamaKegiatan = `${row.total_jp} JP`;
        }

        worksheet.addRow({
            ...row,
            tanggal_lahir: row.tanggal_lahir ? new Date(row.tanggal_lahir) : null,
            start_date: row.start_date ? new Date(row.start_date) : null,
            end_date: row.end_date ? new Date(row.end_date) : null,
            lama_kegiatan: lamaKegiatan,
            
            // Clean Null Values
            nuptk: row.nuptk || '-',
            nip: row.nip || '-',
            no_hp: row.no_hp || '-',
            riwayat_pend_bidang: row.riwayat_pend_bidang || '-',
            riwayat_sertifikasi: row.riwayat_sertifikasi || '-',
            moda_diklat: row.moda_diklat || '-',
            judul_diklat: row.judul_diklat || 'Belum Mengikuti Diklat'
        });
    });

    // Styling Header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Putih
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F4E78' } // Biru Tua
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    
    // AutoFilter
    worksheet.autoFilter = { from: 'A1', to: 'Y1' };

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Laporan_PTK_${Date.now()}.xlsx"`,
      },
    });

  } catch (error) {
    console.error("Error Export Excel:", error);
    return NextResponse.json({ error: 'Gagal export data' }, { status: 500 });
  }
}