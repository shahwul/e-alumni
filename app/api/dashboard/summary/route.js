import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    // Ambil parameter filter dari URL (misal: ?kabupaten=SLEMAN)
    const { searchParams } = new URL(request.url);
    const kabupaten = searchParams.get('kabupaten');

    let query = `
      SELECT 
        COUNT(nik) as total_populasi,
        SUM(CASE WHEN is_sudah_pelatihan THEN 1 ELSE 0 END) as total_alumni,
        SUM(CASE WHEN NOT is_sudah_pelatihan THEN 1 ELSE 0 END) as belum_pelatihan
      FROM mv_dashboard_analitik
    `;

    const values = [];
    
    // Logic Filter Dinamis
    if (kabupaten) {
      query += ` WHERE kabupaten = $1`;
      values.push(kabupaten);
    }

    const res = await pool.query(query, values);
    const data = res.rows[0];

    // Hitung Persentase di Backend biar Frontend terima beres
    const persentase = data.total_populasi > 0 
      ? ((data.total_alumni / data.total_populasi) * 100).toFixed(1) 
      : 0;

    return NextResponse.json({
      ...data,
      persentase_ketercapaian: `${persentase}%`
    });

  } catch (error) {
    console.error('Error Summary:', error);
    return NextResponse.json({ error: 'Gagal ambil data summary' }, { status: 500 });
  }
}