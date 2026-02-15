import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const diklatId = parseInt(id);

    if (!diklatId) {
        return NextResponse.json({ error: 'ID Diklat Invalid' }, { status: 400 });
    }
    const result = await prisma.$transaction(async (tx) => {
        const candidates = await tx.diklat_kandidat.findMany({
            where: { diklat_id: diklatId },
            include: {
                data_ptk: true 
            }
        });

        if (candidates.length === 0) {
            throw new Error("NO_CANDIDATES");
        }

        const alumniData = candidates.map(c => ({
            id_diklat: diklatId,
            nik: c.nik,
            nama_peserta: c.data_ptk?.nama_ptk || '-',
            npsn: c.data_ptk?.npsn || null,
            snapshot_jabatan: c.data_ptk?.jabatan_ptk,
            snapshot_pangkat: c.data_ptk?.pangkat_golongan,
            status_kelulusan: 'Lulus' 
        }));

        const insertResult = await tx.data_alumni.createMany({
            data: alumniData,
            skipDuplicates: true 
        });
        await tx.diklat_kandidat.deleteMany({
            where: { diklat_id: diklatId }
        });

        return insertResult;
    });

    await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_analitik`);

    return NextResponse.json({ 
        success: true, 
        message: `Berhasil memindahkan ${result.count} kandidat ke daftar alumni.` 
    });

  } catch (error) {
    if (error.message === "NO_CANDIDATES") {
        return NextResponse.json({ error: 'Tidak ada kandidat untuk diproses' }, { status: 400 });
    }

    console.error("Error Finalisasi Kandidat:", error);
    return NextResponse.json({ error: 'Gagal memproses data' }, { status: 500 });
  }
}