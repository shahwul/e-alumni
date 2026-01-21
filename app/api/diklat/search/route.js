import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    // Kalau kosong, gak usah balikin apa-apa biar hemat
    if (!query) {
      return NextResponse.json([]);
    }

    // Cari Judul yang mirip (DISTINCT biar gak ada judul kembar)
    const sql = `
      SELECT DISTINCT title 
      FROM master_diklat 
      WHERE title ILIKE $1 
      ORDER BY title ASC 
      LIMIT 10
    `;

    const res = await pool.query(sql, [`%${query}%`]);

    return NextResponse.json(res.rows); // Output: [{ title: '...' }, { title: '...' }]

  } catch (error) {
    console.error("Error Search Diklat:", error);
    return NextResponse.json({ error: 'Gagal mencari diklat' }, { status: 500 });
  }
}