import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const topicId = searchParams.get('topic_id');
    const subTopicId = searchParams.get('sub_topic_id');

    if (!query) return NextResponse.json([]);

    const whereClause = {
      title: { contains: query, mode: 'insensitive' }
    };

    if (topicId && topicId !== 'ALL') {
      whereClause.ref_sub_topik = {
        topic_id: parseInt(topicId)
      };
    }

    if (subTopicId && subTopicId !== 'ALL') {
      whereClause.sub_topic_id = parseInt(subTopicId);
    }

    const results = await prisma.master_diklat.findMany({
      where: whereClause,
      select: {
        title: true 
      },
      distinct: ['title'], 
      orderBy: {
        title: 'asc'
      },
      take: 10 
    });

    return NextResponse.json(results);

  } catch (error) {
    console.error("Error Search Diklat:", error);
    return NextResponse.json({ error: 'Gagal mencari diklat' }, { status: 500 });
  }
}