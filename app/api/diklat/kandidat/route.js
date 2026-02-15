import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // 1. Pakai Prisma Singleton

export async function POST(request) {
  try {
    const { diklat_id, nik_list } = await request.json(); 

    if (!diklat_id || !nik_list || nik_list.length === 0) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const candidatesData = nik_list.map(nik => ({
        diklat_id: parseInt(diklat_id), 
        nik: String(nik)                
    }));

    const result = await prisma.diklat_kandidat.createMany({
        data: candidatesData,
        skipDuplicates: true 
    });

    return NextResponse.json({ 
        message: 'Berhasil menambahkan kandidat', 
        count: result.count 
    });

  } catch (error) {
    console.error("Error add candidates:", error);
    return NextResponse.json({ error: 'Gagal menyimpan data' }, { status: 500 });
  }
}

export async function GET(request) {
    try {
        const data = await prisma.master_diklat.findMany({
            orderBy: {
                start_date: 'desc'
            },
            take: 50,
            select: {
                id: true,
                title: true,
                start_date: true,
                participant_limit: true
            }
        });

        return NextResponse.json({ data });

    } catch (error) {
        console.error("Error GET Diklat List:", error);
        return NextResponse.json({ data: [] });
    }
}