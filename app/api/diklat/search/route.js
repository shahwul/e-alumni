import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { id } from 'zod/v4/locales';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const topicId = searchParams.get('topic_id');
    const subTopicId = searchParams.get('sub_topic_id');

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
    }

    if (subTopicId && subTopicId !== 'ALL') {
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

    return NextResponse.json(results);

  } catch (error) {
    console.error("Error Search Diklat:", error);
    return NextResponse.json({ error: 'Gagal mencari diklat' }, { status: 500 });
  }
}