import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { buildPTKQueryParts } from '@/app/api/ptk/queryBuilder'; // Sesuaikan path ini
import ExcelJS from 'exceljs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 1. PANGGIL QUERY BUILDER (Single Source of Truth)
    // Otomatis handle semua filter, mode eligible/history, dan logic tanggal
    const { 
        whereClause, 
        values, 
        orderByClause, 
        shouldAbort, // Guard Clause dari builder
        modeFilter   // 'eligible' atau 'history'
    } = buildPTKQueryParts(searchParams);

    const isHistoryMode = modeFilter === 'history';

    // 2. CEK ABORT: Kalau builder bilang abort (History tanpa filter), return kosong
    if (shouldAbort) {
        // Return Excel Kosong (Header doang) biar gak error di client
        return generateExcel([], isHistoryMode); 
    }

    // 3. QUERY UTAMA (Tanpa Limit/Offset)
    // Kolom disesuaikan dengan kebutuhan Excel yang kamu minta
    const mainQuery = `
      SELECT * FROM (
          SELECT DISTINCT ON (mv.nik)
            -- Data Identitas
            mv.nama_ptk, mv.nik, mv.nuptk, mv.nip, mv.jenis_kelamin, 
            mv.nama_sekolah, mv.npsn_sekolah, mv.bentuk_pendidikan as jenjang,
            mv.kecamatan, mv.kabupaten, mv.no_hp,
            mv.jenis_ptk, mv.jabatan_ptk, mv.status_kepegawaian, mv.pangkat_golongan,
            
            -- Data History Diklat (Hanya terisi jika ada join/filter diklat)
            mv.judul_diklat, mv.total_jp, mv.start_date, mv.end_date, mv.moda_diklat
          FROM mv_dashboard_analitik mv 
          ${whereClause}
          ORDER BY mv.nik, mv.start_date DESC NULLS LAST
      ) as sub
      ${orderByClause}
    `;
    
    const res = await pool.query(mainQuery, values);
    const rows = res.rows;

    // 4. GENERATE EXCEL (Panggil Helper Bawah)
    return await generateExcel(rows, isHistoryMode);

  } catch (error) {
    console.error("Error Export Excel:", error);
    return NextResponse.json({ error: 'Gagal export data' }, { status: 500 });
  }
}

// ==========================================
// HELPER: GENERATE EXCEL FILE
// ==========================================
async function generateExcel(rows, isHistoryMode) {
    const workbook = new ExcelJS.Workbook();
    const sheetName = isHistoryMode ? 'Riwayat Diklat' : 'Kandidat Peserta';
    const worksheet = workbook.addWorksheet(sheetName);

    // A. DEFINISI KOLOM (Sesuai Request Kamu)
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

    // B. ISI DATA
    rows.forEach((row, index) => {
        const rowData = {
            no: index + 1,
            nama_ptk: row.nama_ptk,
            nik: row.nik,
            nuptk: row.nuptk || '-',
            nama_sekolah: row.nama_sekolah,
            npsn_sekolah: row.npsn_sekolah,
            jenjang: row.jenjang,
            kecamatan: row.kecamatan,
            kabupaten: row.kabupaten,
            jabatan_ptk: row.jabatan_ptk || '-',
            status_kepegawaian: row.status_kepegawaian,
            pangkat_golongan: row.pangkat_golongan || '-',
            no_hp: row.no_hp || '-',
        };

        if (isHistoryMode) {
            rowData.judul_diklat = row.judul_diklat || '-';
            rowData.total_jp = row.total_jp || '-';
            rowData.start_date = row.start_date ? new Date(row.start_date).toLocaleDateString('id-ID') : '-';
            rowData.end_date = row.end_date ? new Date(row.end_date).toLocaleDateString('id-ID') : '-';
            rowData.moda_diklat = row.moda_diklat || '-';
        }

        worksheet.addRow(rowData);
    });

    // C. STYLING HEADER (Warna Warni Sesuai Mode)
    const headerRow = worksheet.getRow(1);
    
    // Warna: Biru (History) / Hijau (Eligible/Kandidat)
    const headerColor = isHistoryMode ? 'FF1F4E78' : 'FF2E7D32'; 
    
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Text Putih
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: headerColor } 
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // D. AUTO FILTER
    worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: columns.length }
    };

    // E. RESPONSE FILE
    const buffer = await workbook.xlsx.writeBuffer();
    const filename = isHistoryMode 
        ? `Riwayat_Diklat_${new Date().toISOString().slice(0,10)}.xlsx` 
        : `Kandidat_PTK_${new Date().toISOString().slice(0,10)}.xlsx`;

    return new NextResponse(buffer, {
        status: 200,
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${filename}"`,
        },
    });
}