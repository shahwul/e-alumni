import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 

export async function GET(request, { params }) {
  try {
    const { id } = await params; 

    if (!id) {
        return NextResponse.json({ data: [] });
    }

    const participants = await prisma.data_alumni.findMany({
        where: { 
            id_diklat: parseInt(id)
        },
        distinct: ['nik'], 
        orderBy: [
            { nik: 'asc' }, 
            { data_ptk: { nama_ptk: 'asc' } }
        ],
        select: {
            nik: true,
            nilai_akhir: true,
            status_kelulusan: true,
            master_diklat: {
                select: {
                    title: true, 
                    start_date: true,
                    end_date: true
                }
            },
            data_ptk: {
                select: {
                    nama_ptk: true,
                    satuan_pendidikan: {
                        select: {
                            nama: true,
                            ref_wilayah: {
                                select: {
                                    kabupaten: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    const flatData = participants.map(p => ({
        nik: p.nik,
        nama_ptk: p.data_ptk?.nama_ptk || '-',
        nama_sekolah: p.data_ptk?.satuan_pendidikan?.nama || '-',
        kabupaten: p.data_ptk?.satuan_pendidikan?.ref_wilayah?.kabupaten || '-',
        nilai_akhir: p.nilai_akhir,
        status_kelulusan: p.status_kelulusan,
        judul_diklat: p.master_diklat?.title,
        start_date: p.master_diklat?.start_date,
        end_date: p.master_diklat?.end_date
    }));

    return NextResponse.json(flatData);

  } catch (error) {
    console.error("Error API Peserta:", error);
    return NextResponse.json({ error: 'Gagal ambil peserta' }, { status: 500 });
  }
}