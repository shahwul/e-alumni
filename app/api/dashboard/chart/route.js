import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Grouping per Kabupaten
    const query = `
      SELECT 
        kabupaten,
        COUNT(nik) as total_guru,
        SUM(CASE WHEN is_sudah_pelatihan THEN 1 ELSE 0 END) as sudah_latih
      FROM mv_dashboard_analitik
      GROUP BY kabupaten
      ORDER BY total_guru DESC
    `;

    const res = await pool.query(query);
    
    return NextResponse.json(res.rows);

  } catch (error) {
    return NextResponse.json({ error: 'Gagal ambil data chart' }, { status: 500 });
  }
}