import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function POST(request) {
  try {
    const user = await getSession(request);
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

    createAuditLog({
      req: request,
      userId: user?.id || "system",
      action: "IMPORT",
      resource: "PESERTA_DIKLAT",
      resourceId: id_diklat.toString(),
      newData: { 
        total_imported: result.count,
        diklat_id: id_diklat,
        sample: alumniData.slice(0, 2).map(a => a.nama_peserta) 
      }
    });

    return NextResponse.json({ 
        success: true, 
        count: result.count 
    });

  } catch (error) {
    console.error("Error Import Alumni:", error);
    return NextResponse.json({ error: 'Gagal import data' }, { status: 500 });
  }
}