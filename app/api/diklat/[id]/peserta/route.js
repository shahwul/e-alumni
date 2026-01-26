import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const query = `
      SELECT 
        dp.nama_ptk,
        dp.nik,
        sp.nama AS nama_sekolah,
        da.status_kelulusan,
        da.nilai_akhir
      FROM data_alumni da
      JOIN data_ptk dp ON da.nik = dp.nik
      LEFT JOIN satuan_pendidikan sp ON dp.npsn = sp.npsn
      WHERE da.id_diklat = $1
      ORDER BY dp.nama_ptk ASC
    `;
    
    const res = await pool.query(query, [id]);
    return NextResponse.json(res.rows);

  } catch (error) {
    return NextResponse.json({ error: 'Gagal ambil peserta' }, { status: 500 });
  }
}