import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 

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
    const body = await request.json();
    const { 
      id, 
      nama_peserta, 
      nik, 
      npsn, 
      snapshot_nama_sekolah, 
      snapshot_jabatan, 
      snapshot_pangkat 
    } = body;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await prisma.data_alumni.update({
      where: { id: parseInt(id) },
      data: {
        nama_peserta,
        nik,
        npsn,
        snapshot_nama_sekolah,
        snapshot_jabatan,
        snapshot_pangkat

      }
    });

    await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_analitik`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error PUT Peserta:", error);
    return NextResponse.json({ error: 'Gagal update data' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await prisma.data_alumni.delete({
      where: { id: parseInt(id) }
    });

    await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_analitik`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error DELETE Peserta:", error);
    return NextResponse.json({ error: 'Gagal hapus data' }, { status: 500 });
  }
}