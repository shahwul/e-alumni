import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const jabatan = await prisma.ref_jabatan_sasaran.findMany({
      select: {
        id: true,
        occupation_name: true,
      },
      orderBy: {
        occupation_name: 'asc',
      },
    });

    return NextResponse.json(jabatan);
  } catch (error) {
    console.error("Error Fetch Jabatan:", error);
    return NextResponse.json({ error: 'Gagal mengambil data jabatan' }, { status: 500 });
  }
}