import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { buildDiklatQuery } from './queryBuilder';
import { createAuditLog } from '@/lib/audit';
import { getSession } from '@/lib/auth';

export async function PUT(request) {
  try {
    const user = await getSession(request);
    const data = await request.json();
    const { id, ...body } = data;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const oldDiklat = await prisma.master_diklat.findUnique({
      where: { id: parseInt(id) }
    });

    if (!oldDiklat) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }

    const updateData = {
      title: body.title,
      short_title: body.short_title,
      start_date: body.start_date ? new Date(body.start_date) : undefined,
      end_date: body.end_date ? new Date(body.end_date) : undefined,
      total_jp: body.total_jp ? parseInt(body.total_jp) : undefined,
      participant_limit: body.participant_limit ? parseInt(body.participant_limit) : undefined,
      description: body.description,
      location: body.location,

      topic_id: body.topic_id ? parseInt(body.topic_id) : undefined,
      sub_topic_id: body.sub_topic_id ? parseInt(body.sub_topic_id) : undefined,
      mode_id: body.mode_id ? parseInt(body.mode_id) : undefined,
      category_id: body.category_id ? parseInt(body.category_id) : undefined,
      education_level_id: body.education_level_id ? parseInt(body.education_level_id) : undefined,
      occupation_id: body.occupation_id ? parseInt(body.occupation_id) : undefined,

      jenis_kegiatan: body.jenis_kegiatan,
      jenis_program: body.jenis_program,
    };

    const result = await prisma.master_diklat.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    createAuditLog({
      req: request,
      userId: user?.id,
      action: "UPDATE",
      resource: "DIKLAT",
      resourceId: id.toString(),
      oldData: oldDiklat,
      newData: result
    });

    return NextResponse.json({ message: 'Diklat updated successfully', data: result });

  } catch (error) {
    console.error("Error updating diklat:", error);
    return NextResponse.json({ error: 'Gagal memperbarui diklat' }, { status: 500 });
  }
}

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