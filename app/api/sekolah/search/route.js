import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query || query.length < 3) {
      return NextResponse.json([]);
    }

    // Ambil nama sekolah yang unik dari view/tabel utama
    // Limit 10 biar ringan
    const sql = `
      SELECT DISTINCT nama_sekolah 
      FROM mv_dashboard_analitik 
      WHERE nama_sekolah ILIKE $1 
      ORDER BY nama_sekolah ASC 
      LIMIT 10
    `;

    const res = await pool.query(sql, [`%${query}%`]);
    
    // Output: [{ nama_sekolah: 'SDN 1 SLEMAN' }, ...]
    return NextResponse.json(res.rows);

  } catch (error) {
    console.error("Error Search Sekolah:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}