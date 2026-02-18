import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const diklatId = searchParams.get('diklat_id');
    const search = searchParams.get('search') || '';

    if (!diklatId) return NextResponse.json({ data: [] });

    const whereClause = {
      id_diklat: parseInt(diklatId), 
    };

    if (search) {
      whereClause.OR = [
        { nama_peserta: { contains: search, mode: 'insensitive' } },
        { nik: { contains: search } },
        { snapshot_nama_sekolah: { contains: search, mode: 'insensitive' } },
      ];
    }

    const results = await prisma.data_alumni.findMany({
      where: whereClause,
      include: {
        satuan_pendidikan: {
          select: { nama: true }
        }
      },
      orderBy: {
        nama_peserta: 'asc',
      },
    });

    const flatData = results.map(row => ({
      ...row,
      nama_sekolah: row.satuan_pendidikan?.nama || row.snapshot_nama_sekolah || '-',
      satuan_pendidikan: undefined 
    }));

    return NextResponse.json({ data: flatData });

  } catch (error) {
    console.error("Error GET Peserta:", error);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await getSession(request);
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const oldData = await prisma.data_alumni.findUnique({
      where: { id: parseInt(id) }
    });

    if (!oldData) return NextResponse.json({ error: 'Data not found' }, { status: 404 });

    const updatedData = await prisma.data_alumni.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_analitik`);

    createAuditLog({
      req: request,
      userId: user?.id,
      action: "UPDATE",
      resource: "PESERTA_DIKLAT",
      resourceId: id.toString(),
      oldData: oldData,
      newData: updatedData 
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error PUT Peserta:", error);
    return NextResponse.json({ error: 'Gagal update data' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = await getSession(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const dataToDelete = await prisma.data_alumni.findUnique({
      where: { id: parseInt(id) }
    });

    if (!dataToDelete) return NextResponse.json({ error: 'Data already gone' }, { status: 404 });

    await prisma.data_alumni.delete({
      where: { id: parseInt(id) }
    });

    await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_analitik`);

    createAuditLog({
      req: request,
      userId: user?.id || "system",
      action: "DELETE",
      resource: "PESERTA_DIKLAT",
      resourceId: id,
      oldData: dataToDelete
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error DELETE Peserta:", error);
    return NextResponse.json({ error: 'Gagal hapus data' }, { status: 500 });
  }
}