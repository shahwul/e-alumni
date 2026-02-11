import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  // PERBAIKAN: Tambahkan 'await' sebelum 'params'
  const { id } = await params; 

  try {
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
    return NextResponse.json(res.rows);

  } catch (error) {
    console.error("Error API Peserta:", error);
    return NextResponse.json({ error: 'Gagal ambil peserta' }, { status: 500 });
  }
}