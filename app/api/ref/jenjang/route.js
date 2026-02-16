import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const jenjang = await prisma.ref_jenjang_sasaran.findMany({
      select: {
        id: true,
        level_name: true,
      },
      orderBy: {
        level_name: 'asc',
      },
    });

    return NextResponse.json(jenjang);
  } catch (error) {
    console.error("Error Fetch Jenjang:", error);
    return NextResponse.json({ error: 'Gagal mengambil data jenjang' }, { status: 500 });
  }
}