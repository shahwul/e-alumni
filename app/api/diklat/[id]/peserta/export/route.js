import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import ExcelJS from 'exceljs';

export async function GET(request, { params }) {
  try {
    const { id } = await params; // Ambil ID Diklat dari URL

    // 1. QUERY DATA PESERTA + NAMA DIKLAT
    // Kita join ke MV (Materialized View) atau tabel PTK untuk dapat nama & sekolah
    const query = `
      SELECT DISTINCT ON (da.nik)
        da.nik,
        mv.nama_ptk,
        mv.nama_sekolah,
        mv.kabupaten,
        da.nilai_akhir,
        da.status_kelulusan,
        md.title as judul_diklat,
        md.start_date,
        md.end_date
      FROM data_alumni da
      JOIN mv_dashboard_analitik mv ON da.nik = mv.nik
      JOIN master_diklat md ON da.id_diklat = md.id
      WHERE da.id_diklat = $1
      ORDER BY da.nik, mv.nama_ptk ASC
    `;

    const res = await pool.query(query, [id]);
    const rows = res.rows;
    
    // Ambil judul diklat dari baris pertama (jika ada data) untuk nama file
    const judulDiklat = rows.length > 0 ? rows[0].judul_diklat : 'Diklat';

    // 2. GENERATE EXCEL
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Peserta Diklat');

    // Definisi Kolom
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama Lengkap', key: 'nama_ptk', width: 30 },
      { header: 'NIK', key: 'nik', width: 20 },
      { header: 'Unit Kerja', key: 'nama_sekolah', width: 30 },
      { header: 'Kabupaten', key: 'kabupaten', width: 20 },
      { header: 'Nilai Akhir', key: 'nilai_akhir', width: 15 },
      { header: 'Status Kelulusan', key: 'status_kelulusan', width: 20 },
    ];

    // Isi Data
    rows.forEach((row, index) => {
      worksheet.addRow({
        no: index + 1,
        nama_ptk: row.nama_ptk,
        nik: row.nik,
        nama_sekolah: row.nama_sekolah,
        kabupaten: row.kabupaten,
        nilai_akhir: row.nilai_akhir || '-',
        status_kelulusan: row.status_kelulusan
      });
    });

    // Styling Header (Warna Orange biar beda dikit sama PTK)
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFED7D31' } // Orange
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Auto Filter
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: 7 }
    };

    // 3. RETURN FILE
    const buffer = await workbook.xlsx.writeBuffer();
    // Bersihkan nama file dari karakter aneh
    const safeTitle = judulDiklat.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    const filename = `Peserta_${safeTitle}_${new Date().toISOString().slice(0,10)}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error("Error Export Peserta:", error);
    return NextResponse.json({ error: 'Gagal export data' }, { status: 500 });
  }
}