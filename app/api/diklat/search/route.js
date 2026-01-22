import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const topicId = searchParams.get('topic_id');         // Parameter Baru
    const subTopicId = searchParams.get('sub_topic_id');  // Parameter Baru

    // Minimal ketik 3 huruf (opsional, sesuaikan kebutuhan)
    if (!query) return NextResponse.json([]);

    // Base Query: JOIN ke ref_sub_topik biar bisa filter by Topic ID
    let sql = `
      SELECT DISTINCT md.title 
      FROM master_diklat md
      LEFT JOIN ref_sub_topik rst ON md.sub_topic_id = rst.id
      WHERE md.title ILIKE $1
    `;
    
    const values = [`%${query}%`];
    let counter = 2;

    // 1. Filter by Rumpun (Topic)
    if (topicId && topicId !== 'ALL') {
      sql += ` AND rst.topic_id = $${counter}`;
      values.push(topicId);
      counter++;
    }

    // 2. Filter by Sub Rumpun (Sub Topic)
    if (subTopicId && subTopicId !== 'ALL') {
      sql += ` AND md.sub_topic_id = $${counter}`;
      values.push(subTopicId);
      counter++;
    }

    sql += ` ORDER BY md.title ASC LIMIT 10`;

    const res = await pool.query(sql, values);
    return NextResponse.json(res.rows);

  } catch (error) {
    console.error("Error Search Diklat:", error);
    return NextResponse.json({ error: 'Gagal mencari diklat' }, { status: 500 });
  }
}