import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Sesuaikan nama tabel dan kolom dengan database kamu.
    // Biasanya namanya 'ref_topik' atau 'master_topik'
    const query = `
      SELECT id, topic_name 
      FROM ref_topik 
      ORDER BY id ASC
    `;
    
    const res = await pool.query(query);
    
    return NextResponse.json(res.rows);

  } catch (error) {
    console.error("Error API Rumpun:", error);
    return NextResponse.json({ error: 'Gagal ambil data rumpun' }, { status: 500 });
  }
}