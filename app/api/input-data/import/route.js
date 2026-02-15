import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { id_diklat, peserta } = await request.json();

    if (!peserta || peserta.length === 0) {
        return NextResponse.json({ error: 'Data kosong' }, { status: 400 });
    }

    const alumniData = peserta.map(p => ({
        id_diklat: parseInt(id_diklat), 
        nama_peserta: p.Nama,
        nik: String(p.NIK),
        npsn: String(p.NPSN),
        snapshot_jabatan: p.Jabatan,
        snapshot_pangkat: p.Golongan,
        status_kelulusan: 'Lulus'  
    }));

    const result = await prisma.data_alumni.createMany({
        data: alumniData,
        skipDuplicates: false 
    });

    await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_analitik`);

    return NextResponse.json({ 
        success: true, 
        count: result.count 
    });

  } catch (error) {
    console.error("Error Import Alumni:", error);
    return NextResponse.json({ error: 'Gagal import data' }, { status: 500 });
  }
}