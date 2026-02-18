import { NextResponse } from 'next/server';
<<<<<<< HEAD
import pool from '@/lib/db';
=======
import prisma from '@/lib/prisma';
import { id } from 'zod/v4/locales';
>>>>>>> 039b2f2c290143746972999032bb8270416ff878

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const topicId = searchParams.get('topic_id');         // Parameter Baru
    const subTopicId = searchParams.get('sub_topic_id');  // Parameter Baru

<<<<<<< HEAD
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
=======
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!query && !startDate) return NextResponse.json([]);

    const whereClause = {
      AND: []
    };

    if (query) {
      whereClause.AND.push({
        title: { contains: query, mode: 'insensitive' }
      });
    }

    if (topicId && topicId !== 'ALL') {
      whereClause.AND.push({
        ref_sub_topik: { topic_id: parseInt(topicId) }
      });
>>>>>>> 039b2f2c290143746972999032bb8270416ff878
    }

    // 2. Filter by Sub Rumpun (Sub Topic)
    if (subTopicId && subTopicId !== 'ALL') {
<<<<<<< HEAD
      sql += ` AND md.sub_topic_id = $${counter}`;
      values.push(subTopicId);
      counter++;
    }

    sql += ` ORDER BY md.title ASC LIMIT 10`;
=======
      whereClause.AND.push({
        sub_topic_id: parseInt(subTopicId)
      });
    }

    if (startDate && endDate) {
      whereClause.AND.push({
        start_date: { gte: new Date(startDate) },
        end_date: { lte: new Date(endDate + "T23:59:59") }
      });
    }

    const results = await prisma.master_diklat.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        start_date: true, 
        end_date: true,
      },
      orderBy: {
        start_date: 'desc' 
      },
      take: 15
    });
>>>>>>> 039b2f2c290143746972999032bb8270416ff878

    const res = await pool.query(sql, values);
    return NextResponse.json(res.rows);

  } catch (error) {
    console.error("Error Search Diklat:", error);
    return NextResponse.json({ error: 'Gagal mencari diklat' }, { status: 500 });
  }
}