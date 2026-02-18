import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(request, { params }) {
  try {
    const { id } = await params; 

    if (!id) {
        return NextResponse.json({ data: [] });
    }

    const rawData = await prisma.diklat_kandidat.findMany({
        where: {
            diklat_id: parseInt(id)
        },
        orderBy: {
            data_ptk: { nama_ptk: 'asc' }
        },
        include: {
            data_ptk: {
                include: {
                    satuan_pendidikan: {
                        include: {
                            ref_wilayah: true 
                        }
                    }
                }
            }
        }
    });

    const flatData = rawData.map(item => {
        const ptk = item.data_ptk || {};
        const sekolah = ptk.satuan_pendidikan || {};
        const wilayah = sekolah.ref_wilayah || {};

        return {
            kandidat_id: item.id, 
            diklat_id: item.diklat_id,
            status: item.status,
            ...ptk, 
            nama_sekolah: sekolah.nama || '-',
            kabupaten: wilayah.kabupaten || '-',
            kecamatan: wilayah.kecamatan || '-',

            satuan_pendidikan: undefined 
        };
    });

    return NextResponse.json({ data: flatData });

  } catch (error) {
    console.error("Error fetch kandidat:", error);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

export async function DELETE(request) {
    try {
        const user = await getSession(request);
        const { searchParams } = new URL(request.url);
        const kandidatId = searchParams.get('kandidat_id');

        if (!kandidatId) {
            return NextResponse.json({ error: 'ID Kandidat diperlukan' }, { status: 400 });
        }

        const targetKandidat = await prisma.diklat_kandidat.findUnique({
            where: { id: parseInt(kandidatId) },
            include: {
                data_ptk: {
                    select: { nama_ptk: true }
                }
            }
        });

        if (!targetKandidat) {
            return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
        }

        await prisma.diklat_kandidat.delete({
            where: { id: parseInt(kandidatId) }
        });

        createAuditLog({
            req: request,
            userId: user?.id,
            action: "DELETE_KANDIDAT",
            resource: "DIKLAT_KANDIDAT",
            resourceId: kandidatId,
            oldData: {
                id: targetKandidat.id,
                nik: targetKandidat.nik,
                nama: targetKandidat.data_ptk?.nama_ptk || "Unknown",
                diklat_id: targetKandidat.diklat_id
            }
        });

        return NextResponse.json({ message: 'Kandidat berhasil dihapus dari daftar mapping' });

    } catch (error) {
        console.error("Error delete kandidat:", error);
        return NextResponse.json({ error: 'Gagal menghapus data' }, { status: 500 });
    }
}