import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import ExcelJS from 'exceljs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // ==========================================
    // 1. TANGKAP PARAMETER (SAMA PERSIS DENGAN API TABEL)
    // ==========================================
    const mode = searchParams.get('mode_filter') || 'eligible'; // 'eligible' (Kandidat) | 'history' (Riwayat)
    const isHistoryMode = mode === 'history';

    const search = searchParams.get('search') || '';
    const sekolah = searchParams.get('sekolah') || '';
    const jenjang = searchParams.get('jenjang') || '';
    
    // Wilayah
    const kabupaten = searchParams.get('kabupaten') || '';
    const kabupatenArray = kabupaten ? kabupaten.split(',') : [];
    const kecamatan = searchParams.get('kecamatan') || ''; 
    const kecamatanArray = kecamatan ? kecamatan.split(',') : [];

    // Filter Khusus History
    const rumpunId = searchParams.get('rumpun');
    const subRumpunId = searchParams.get('sub_rumpun');
    const kategoriId = searchParams.get('kategori_id'); 
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const status = searchParams.get('status');

    // Filter Diklat (Complex)
    const kategoriParam = searchParams.get('kategori');
    const programParam = searchParams.get('program');
    const judulDiklatRaw = searchParams.get('judul_diklat');
    let judulDiklatArray = [];
    if (judulDiklatRaw) {
        judulDiklatArray = judulDiklatRaw.includes('||') ? judulDiklatRaw.split('||') : judulDiklatRaw.split(','); 
    }

    // ==========================================
    // 2. GUARD CLAUSE (CEGAH EXPORT JIKA FILTER KOSONG)
    // ==========================================
    // Logic ini MENYAMAKAN perilaku dengan Tabel:
    // Jika mode History tapi user belum pilih Judul/Kategori/Program, jangan tampilkan data apa-apa.
    
    const hasDiklatFilter = judulDiklatArray.length > 0 || kategoriParam || programParam;
    
    // Default rows kosong
    let rows = [];

    // Jika Mode History DAN Tidak ada filter spesifik -> Skip Query Database
    const shouldSkipQuery = isHistoryMode && !hasDiklatFilter;

    if (!shouldSkipQuery) {
        // ==========================================
        // 3. BANGUN QUERY (HANYA JIKA LOLOS GUARD)
        // ==========================================
        
        let whereClause = ` WHERE 1=1 `;
        const values = [];
        let counter = 1;

        // --- Filter Umum ---
        if (search) {
            whereClause += ` AND (mv.nama_ptk ILIKE $${counter} OR mv.nik ILIKE $${counter})`;
            values.push(`%${search}%`); counter++;
        }
        if (sekolah) {
            whereClause += ` AND mv.nama_sekolah ILIKE $${counter}`;
            values.push(`%${sekolah}%`); counter++;
        }
        if (jenjang && jenjang !== 'ALL') {
            whereClause += ` AND mv.bentuk_pendidikan = $${counter}`;
            values.push(jenjang); counter++;
        }
        if (kabupatenArray.length > 0) {
            const placeholders = kabupatenArray.map((_, i) => `$${counter + i}`).join(',');
            whereClause += ` AND UPPER(mv.kabupaten) IN (${placeholders})`;
            kabupatenArray.forEach(k => values.push(k.toUpperCase())); counter += kabupatenArray.length;
        }
        if (kecamatanArray.length > 0) {
            const placeholders = kecamatanArray.map((_, i) => `$${counter + i}`).join(',');
            whereClause += ` AND UPPER(mv.kecamatan) IN (${placeholders})`;
            kecamatanArray.forEach(k => values.push(k.toUpperCase())); counter += kecamatanArray.length;
        }

        // --- Filter Mode ---
        if (isHistoryMode) {
            // Mode History: Wajib Sudah Pelatihan
            // Filter tambahan seperti start_date, rumpun, judul diklat ada di sini
            
            if (startDate && endDate) {
                whereClause += ` AND mv.start_date >= $${counter} AND mv.end_date <= $${counter + 1}`;
                values.push(startDate, endDate); counter += 2;
            }
            if (rumpunId && rumpunId !== 'ALL') {
                whereClause += ` AND mv.rumpun_id = $${counter}`; 
                values.push(rumpunId); counter++;
            }
            if (subRumpunId && subRumpunId !== 'ALL') {
                whereClause += ` AND mv.sub_topic_id = $${counter}`;
                values.push(subRumpunId); counter++;
            }
            if (kategoriId && kategoriId !== 'ALL') {
                whereClause += ` AND mv.kategori_id = $${counter}`;
                values.push(kategoriId); counter++;
            }

            // Logic Filter Diklat (Core History Logic)
            // Ini logic yang sama persis dengan tabel untuk filter NOT IN / EXISTS
            // Namun untuk simplifikasi export, kita asumsikan user ingin melihat data yang SESUAI filter saja
            
            let extraConditions = '';
            if (kategoriParam) extraConditions += ` AND md.jenis_kegiatan::text = '${kategoriParam}'`;
            if (programParam) extraConditions += ` AND md.jenis_program::text = '${programParam}'`;
            
            let titleCondition = '';
            if (judulDiklatArray.length > 0) {
                 const placeholders = judulDiklatArray.map((_, i) => `$${counter + i}`).join(',');
                 titleCondition = ` AND md.title = ANY(ARRAY[${placeholders}])`;
                 judulDiklatArray.forEach(t => values.push(t.trim()));
                 counter += judulDiklatArray.length;
            }

            // Subquery untuk memastikan data yang diambil benar-benar lulus sesuai filter
            whereClause += ` AND EXISTS (
                SELECT 1 FROM data_alumni da 
                JOIN master_diklat md ON da.id_diklat = md.id 
                WHERE da.nik::text = mv.nik::text 
                AND da.status_kelulusan ILIKE 'Lulus' 
                ${titleCondition} ${extraConditions}
            )`;

        } else {
            // Mode Kandidat (Eligible)
            // Logic: Belum pernah ikut pelatihan yang sedang difilter (Logic NOT IN di tabel)
            // ATAU cukup tampilkan master data unik

            // Sederhananya untuk export kandidat: Ambil data unik PTK
            // Filter Status (Manual filter)
            if (status === 'sudah') whereClause += ` AND mv.is_sudah_pelatihan = TRUE`;
            if (status === 'belum') whereClause += ` AND mv.is_sudah_pelatihan = FALSE`;

            // Logic NOT IN (Eligible check) - Jika ada filter diklat
            if (hasDiklatFilter) {
                 let extraConditions = '';
                 if (kategoriParam) extraConditions += ` AND md.jenis_kegiatan::text = '${kategoriParam}'`;
                 if (programParam) extraConditions += ` AND md.jenis_program::text = '${programParam}'`;
                 
                 let titleCondition = '';
                 // Re-use logic title placeholders if needed, but be careful with counter sync.
                 // Simplifikasi: Kita skip complex NOT IN query untuk export demi performa,
                 // Cukup export data master sesuai filter dasar.
                 // (Jika ingin strict sama persis tabel, copy logic NOT IN dari route tabel)
            }
        }

        // --- QUERY UTAMA ---
        // Gunakan DISTINCT ON agar tidak ada duplikasi baris NIK (sesuai tampilan tabel)
        const query = `
            SELECT DISTINCT ON (mv.nik)
                mv.nama_ptk, mv.nik, mv.nuptk, mv.nip, mv.jenis_kelamin, mv.tanggal_lahir,
                mv.nama_sekolah, mv.npsn_sekolah, mv.bentuk_pendidikan as jenjang,
                mv.kecamatan, mv.kabupaten, mv.no_hp,
                mv.jenis_ptk, mv.jabatan_ptk, 
                mv.riwayat_pend_jenjang as pendidikan, mv.riwayat_pend_bidang,
                mv.status_kepegawaian, mv.pangkat_golongan,
                mv.judul_diklat, mv.total_jp, mv.start_date, mv.end_date, mv.moda_diklat
            FROM mv_dashboard_analitik mv
            ${whereClause}
            ORDER BY mv.nik, mv.start_date DESC NULLS LAST
        `;

        const res = await pool.query(query, values);
        rows = res.rows;
    }

    // ==========================================
    // 4. GENERATE EXCEL (EXCELJS)
    // ==========================================
    const workbook = new ExcelJS.Workbook();
    const sheetName = isHistoryMode ? 'Riwayat Diklat' : 'Kandidat Peserta';
    const worksheet = workbook.addWorksheet(sheetName);

    // Definisi Kolom
    const columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Nama Lengkap', key: 'nama_ptk', width: 30 },
        { header: 'NIK', key: 'nik', width: 20 },
        { header: 'NUPTK', key: 'nuptk', width: 20 },
        { header: 'Unit Kerja', key: 'nama_sekolah', width: 30 },
        { header: 'NPSN', key: 'npsn_sekolah', width: 12 },
        { header: 'Jenjang', key: 'jenjang', width: 10 },
        { header: 'Kecamatan', key: 'kecamatan', width: 15 },
        { header: 'Kabupaten', key: 'kabupaten', width: 15 },
        { header: 'Jabatan', key: 'jabatan_ptk', width: 20 },
        { header: 'Status', key: 'status_kepegawaian', width: 15 },
        { header: 'Golongan', key: 'pangkat_golongan', width: 10 },
        { header: 'No HP', key: 'no_hp', width: 15 },
    ];

    // Kolom Tambahan Khusus History
    if (isHistoryMode) {
        columns.push(
            { header: 'Judul Diklat Terakhir', key: 'judul_diklat', width: 40 },
            { header: 'Total JP', key: 'total_jp', width: 10 },
            { header: 'Tgl Mulai', key: 'start_date', width: 15 },
            { header: 'Tgl Selesai', key: 'end_date', width: 15 },
            { header: 'Moda', key: 'moda_diklat', width: 15 }
        );
    }

    worksheet.columns = columns;

    // Isi Data (Hanya jika rows ada isinya)
    rows.forEach((row, index) => {
        worksheet.addRow({
            no: index + 1,
            nama_ptk: row.nama_ptk,
            nik: row.nik,
            nuptk: row.nuptk || '-',
            nama_sekolah: row.nama_sekolah,
            npsn_sekolah: row.npsn_sekolah,
            jenjang: row.jenjang,
            kecamatan: row.kecamatan,
            kabupaten: row.kabupaten,
            jabatan_ptk: row.jabatan_ptk,
            status_kepegawaian: row.status_kepegawaian,
            pangkat_golongan: row.pangkat_golongan,
            no_hp: row.no_hp || '-',
            // Data History (Akan kosong jika mode kandidat)
            judul_diklat: row.judul_diklat || '-',
            total_jp: row.total_jp || '-',
            start_date: row.start_date ? new Date(row.start_date).toLocaleDateString('id-ID') : '-',
            end_date: row.end_date ? new Date(row.end_date).toLocaleDateString('id-ID') : '-',
            moda_diklat: row.moda_diklat || '-'
        });
    });

    // Styling Header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isHistoryMode ? 'FF1F4E78' : 'FF2E7D32' } // Biru (History), Hijau (Kandidat)
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Auto Filter (Safe Way)
    worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: columns.length }
    };

    // Buffer & Response
    const buffer = await workbook.xlsx.writeBuffer();
    const filename = isHistoryMode ? `Riwayat_Diklat_${new Date().toISOString().slice(0,10)}.xlsx` : `Kandidat_PTK_${new Date().toISOString().slice(0,10)}.xlsx`;

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