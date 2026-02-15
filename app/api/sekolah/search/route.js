import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    if (!query || query.length < 3) {
      return NextResponse.json([]);
    }
    
    const sekolah = await prisma.mv_dashboard_analitik.findMany({
      where: {
        nama_sekolah: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        nama_sekolah: true,
      },
      distinct: ['nama_sekolah'], 
      orderBy: {
        nama_sekolah: 'asc',
      },
      take: 10, 
    });

    return NextResponse.json(sekolah);

  } catch (error) {
    console.error("Error Search Sekolah:", error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}