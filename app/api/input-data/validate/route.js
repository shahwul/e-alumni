import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 

export async function POST(request) {
  try {
    const { peserta, diklatId } = await request.json(); 
    
    if (!peserta || peserta.length === 0) {
      return NextResponse.json({ data: [] });
    }
    const nikList = peserta.map(p => String(p.NIK)).filter(n => n);
    const npsnList = peserta.map(p => String(p.NPSN)).filter(n => n);
    
    if (nikList.length === 0) {
       return NextResponse.json({ error: "Tidak ada NIK ditemukan dalam file" }, { status: 400 });
    }

    const queries = [
        prisma.data_ptk.findMany({
            where: { nik: { in: nikList } },
            select: { 
                nik: true, 
                nama_ptk: true, 
                npsn: true, 
                jabatan_ptk: true, 
                pangkat_golongan: true 
            }
        }),

        prisma.satuan_pendidikan.findMany({
            where: { npsn: { in: npsnList } },
            select: { npsn: true, nama: true },
            distinct: ['npsn']
        })
    ];
    if (diklatId) {
        queries.push(
            prisma.data_alumni.findMany({
                where: { 
                    id_diklat: parseInt(diklatId),
                    nik: { in: nikList } 
                },
                select: { nik: true }
            })
        );
    } else {
        queries.push(Promise.resolve([]));
    }

    const [foundPTK, foundSekolah, registeredAlumni] = await Promise.all(queries);
    const registeredNiks = new Set(registeredAlumni.map(row => row.nik));

    const validatedData = peserta.map(p => {
        const excelNpsn = String(p.NPSN || "").trim();
        const excelNik = String(p.NIK || "").trim();

        const matchPTK = foundPTK.find(db => db.nik === excelNik);
        const matchSekolah = foundSekolah.find(s => s.npsn === excelNpsn);

        let isValid = true;
        let status_msg = "Valid";
        let suggestions = {};
        let nama_sekolah_display = matchSekolah ? matchSekolah.nama : "NPSN Tidak Ditemukan";

        if (registeredNiks.has(excelNik)) {
            isValid = false;
            isValid = false; 
            status_msg = "Sudah Terdaftar di Diklat ini";
        }
        else if (!matchPTK) {
            isValid = false;
            status_msg = "NIK Tidak Terdaftar di Database";
        } 
        else {
            if (p.Nama && matchPTK.nama_ptk && matchPTK.nama_ptk.trim().toLowerCase() !== p.Nama.trim().toLowerCase()) {
                suggestions.nama_db = matchPTK.nama_ptk;
            }
            if (matchPTK.npsn !== excelNpsn) {
                status_msg = `Info: Mutasi (Data Lama: ${matchPTK.npsn || '-'})`;
            }
            if (!matchSekolah) {
                isValid = false; 
                status_msg = "NPSN Sekolah Tidak Valid";
                nama_sekolah_display = "-";
            }
        }

        return {
            ...p,
            isValid,
            status_msg,
            ...suggestions,
            sekolah_auto: nama_sekolah_display,
            db_data: matchPTK ? { 
                nama: matchPTK.nama_ptk, 
                jabatan: matchPTK.jabatan_ptk, 
                golongan: matchPTK.pangkat_golongan, 
                npsn: matchPTK.npsn, 
                sekolah: matchSekolah ? matchSekolah.nama : null 
            } : null
        };
    });

    return NextResponse.json({ data: validatedData });

  } catch (error) {
    console.error("Error Validation:", error);
    return NextResponse.json({ error: 'Gagal memvalidasi data' }, { status: 500 });
  }
}