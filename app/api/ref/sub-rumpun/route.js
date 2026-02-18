import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topic_id');
    if (!topicId) {
      return NextResponse.json([]);
    }
    const subRumpun = await prisma.ref_sub_topik.findMany({
      where: {
        topic_id: parseInt(topicId) 
      },
      select: {
        id: true,
        sub_topic_name: true,
      },
      orderBy: {
        sub_topic_name: 'asc',
      },
    });

    return NextResponse.json(subRumpun);

  } catch (error) {
    console.error("Error Sub Rumpun:", error);
    return NextResponse.json(
      { error: 'Gagal mengambil data sub-rumpun' }, 
      { status: 500 }
    );
  }
}