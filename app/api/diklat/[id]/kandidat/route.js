import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 

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

    flatData.sort((a, b) => {
        return a.kabupaten.localeCompare(b.kabupaten);
    });

    return NextResponse.json({ data: flatData });

  } catch (error) {
    console.error("Error fetch kandidat:", error);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
    try {
        const { searchParams } = new URL(request.url);
        const kandidatId = searchParams.get('kandidat_id');

        if (!kandidatId) {
            return NextResponse.json({ error: 'ID Kandidat diperlukan' }, { status: 400 });
        }

        await prisma.diklat_kandidat.delete({
            where: {
                id: parseInt(kandidatId) 
            }
        });

        return NextResponse.json({ message: 'Kandidat dihapus' });

    } catch (error) {
        console.error("Error delete kandidat:", error);
        return NextResponse.json({ error: 'Gagal menghapus' }, { status: 500 });
    }
}