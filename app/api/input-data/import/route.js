import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const { id_diklat, peserta } = await request.json();
        const diklatId = parseInt(id_diklat);

        if (!peserta || peserta.length === 0) {
            return NextResponse.json({ error: 'Data kosong' }, { status: 400 });
        }

        const resultAction = await prisma.$transaction(async (tx) => {
            const diklat = await tx.master_diklat.findUnique({
                where: { id: diklatId },
                select: {
                    participant_limit: true,
                    _count: {
                        select: { data_alumni: true }
                    }
                }
            });

            if (!diklat) throw new Error("DIKLAT_NOT_FOUND");

            const currentAlumniCount = diklat._count.data_alumni;
            const incomingCount = peserta.length;
            const totalAfterImport = currentAlumniCount + incomingCount;

            if (diklat.participant_limit && totalAfterImport > diklat.participant_limit) {
                const sisa = diklat.participant_limit - currentAlumniCount;
                const err = new Error("OVER_LIMIT");
                err.sisa = sisa;
                err.incoming = incomingCount;
                throw err;
            }

            const alumniData = peserta.map(p => ({
                id_diklat: diklatId,
                nama_peserta: p.Nama,
                nik: String(p.NIK),
                npsn: String(p.NPSN),
                snapshot_jabatan: p.Jabatan,
                snapshot_pangkat: p.Golongan,
                status_kelulusan: 'Lulus'
            }));

            return await tx.data_alumni.createMany({
                data: alumniData,
                skipDuplicates: true
            });
        });

        prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_analitik`)
            .catch(err => console.error("Background Refresh Error:", err));

        return NextResponse.json({
            success: true,
            count: resultAction.count
        });

    } catch (error) {
        if (error.message === "DIKLAT_NOT_FOUND") {
            return NextResponse.json({ error: 'Data diklat tidak ditemukan' }, { status: 404 });
        }

        if (error.message === "OVER_LIMIT") {
            return NextResponse.json({
                error: `Kuota tidak mencukupi. Sisa kuota: ${error.sisa}, jumlah di file: ${error.incoming}.`
            }, { status: 400 });
        }

        console.error("Error Import Alumni:", error);
        return NextResponse.json({ error: 'Gagal import data' }, { status: 500 });
    }
}