import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const topicId = searchParams.get('topic_id');

  if (!topicId) return NextResponse.json([]);

  try {
    const query = `
      SELECT id, sub_topic_name
      FROM ref_sub_topik 
      WHERE topic_id = $1 
      ORDER BY sub_topic_name ASC
    `;
    const res = await pool.query(query, [topicId]);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error("Error Sub Rumpun:", error);
    return NextResponse.json({ error: 'Gagal' }, { status: 500 });
  }
}