import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { buildDiklatQuery } from './queryBuilder';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const { where, skip, limit, orderBy, page } = buildDiklatQuery(searchParams);
    const [total, data] = await prisma.$transaction([
      prisma.master_diklat.count({ where }),
      prisma.master_diklat.findMany({
        where,
        take: limit,
        skip,
        orderBy,
        include: {
          ref_topik: true,
          ref_sub_topik: true,
          ref_mode: true,
          ref_jenjang_sasaran: true,
          ref_jabatan_sasaran: true,
          _count: {
            select: {
              data_alumni: true,
              diklat_kandidat: true
            }
          }
        }
      })
    ]);

    const formattedData = data.map(item => ({
      ...item,
      topic_name: item.ref_topik?.topic_name,
      sub_topic_name: item.ref_sub_topik?.sub_topic_name,
      moda: item.ref_mode?.mode_name,
      sasaran_jenjang: item.ref_jenjang_sasaran?.level_name,
      sasaran_jabatan: item.ref_jabatan_sasaran?.occupation_name,
      total_peserta: item._count.data_alumni,
      total_kandidat: item._count.diklat_kandidat,

      ref_topik: undefined,
      ref_sub_topik: undefined,
      ref_mode: undefined,
      ref_jenjang_sasaran: undefined,
      ref_jabatan_sasaran: undefined,
      _count: undefined
    }));

    return NextResponse.json({
      data: formattedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error API Diklat:", error);
    return NextResponse.json({ error: 'Gagal memuat data diklat' }, { status: 500 });
  }
}