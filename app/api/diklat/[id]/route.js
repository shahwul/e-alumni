import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const diklatId = parseInt(id);

    if (!diklatId) return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });

    const data = await prisma.master_diklat.findUnique({
      where: { id: diklatId },
      include: {
        _count: {
          select: { data_alumni: true } 
        }
      }
    });

    if (!data) return NextResponse.json({ error: 'Diklat tidak ditemukan' }, { status: 404 });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error GET Detail Diklat:", error);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params; 
    const body = await request.json();

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const updateData = {
      title: body.title,
      short_title: body.short_title,
      start_date: body.start_date ? new Date(body.start_date) : undefined,
      end_date: body.end_date ? new Date(body.end_date) : undefined,
      total_jp: body.total_jp ? parseInt(body.total_jp) : undefined,
      participant_limit: body.participant_limit !== undefined ? parseInt(body.participant_limit) : undefined,
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

    prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_analitik`)
      .catch(err => console.error("Background Refresh Error:", err));

    return NextResponse.json({ message: 'Diklat updated successfully', data: result });

  } catch (error) {
    console.error("Error updating diklat:", error);
    return NextResponse.json({ error: 'Gagal memperbarui diklat' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const diklatId = parseInt(id);

    await prisma.master_diklat.delete({
      where: { id: diklatId }
    });

    prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_analitik`)
      .catch(err => console.error(err));

    return NextResponse.json({ success: true, message: "Diklat berhasil dihapus" });
  } catch (error) {
    console.error("Error DELETE Diklat:", error);
    return NextResponse.json({ error: 'Gagal menghapus diklat' }, { status: 500 });
  }
}