import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const rumpun = await prisma.ref_topik.findMany({
      select: {
        id: true,
        topic_name: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
    
    return NextResponse.json(rumpun);

  } catch (error) {
    console.error("Error API Rumpun:", error);
    return NextResponse.json(
      { error: 'Gagal ambil data rumpun' }, 
      { status: 500 }
    );
  }
}