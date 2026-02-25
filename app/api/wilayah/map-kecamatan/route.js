import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  const { names } = await req.json();
  
  const wilayah = await prisma.ref_wilayah.findMany({
    where: {
      kecamatan: { in: names }
    },
    select: { kode_kecamatan: true }
  });

  const codes = wilayah.map(w => w.kode_kecamatan.trim());
  return NextResponse.json({ codes });
}