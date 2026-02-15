import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 

export async function GET() {
  try {
    const rawWilayah = await prisma.ref_wilayah.findMany({
      distinct: ['kabupaten', 'kecamatan'],
      select: {
        kabupaten: true,
        kecamatan: true,
      },
      orderBy: [
        { kabupaten: 'asc' },
        { kecamatan: 'asc' },
      ],
    });

    const groupedData = [];
    const kabMap = new Map();

    rawWilayah.forEach(item => {
      const kab = item.kabupaten?.trim();
      const kec = item.kecamatan?.trim();

      if (!kab) return;

      if (!kabMap.has(kab)) {
        const newKab = {
          kabupaten: kab,
          kecamatan: []
        };
        kabMap.set(kab, newKab.kecamatan);
        groupedData.push(newKab);
      }
      
      if (kec) {
        kabMap.get(kab).push(kec);
      }
    });

    return NextResponse.json(groupedData);

  } catch (error) {
    console.error("Error API Wilayah:", error);
    return NextResponse.json(
      { error: 'Gagal mengambil data wilayah' }, 
      { status: 500 }
    );
  }
}