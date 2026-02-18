import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 

export const revalidate = 3600;

export async function GET() {
  try {
    const [jenisPtkRes, statusRes, mapelRes, jurusanRes] = await Promise.all([
      prisma.data_ptk.findMany({
        where: {
          NOT: [
            { jenis_ptk: null },
            { jenis_ptk: "" }
          ]
        },
        distinct: ['jenis_ptk'],
        select: { jenis_ptk: true },
        orderBy: { jenis_ptk: 'asc' }
      }),

      prisma.data_ptk.findMany({
        where: {
          NOT: [
            { status_kepegawaian: null },
            { status_kepegawaian: "" }
          ]
        },
        distinct: ['status_kepegawaian'],
        select: { status_kepegawaian: true },
        orderBy: { status_kepegawaian: 'asc' }
      }),

      prisma.data_ptk.findMany({
        where: {
          NOT: [
            { riwayat_sertifikasi: null },
            { riwayat_sertifikasi: "" }
          ]
        },
        distinct: ['riwayat_sertifikasi'],
        select: { riwayat_sertifikasi: true },
        orderBy: { riwayat_sertifikasi: 'asc' }
      }),

      prisma.data_ptk.findMany({
        where: {
          NOT: [
            { riwayat_pend_bidang: null },
            { riwayat_pend_bidang: "" }
          ]
        },
        distinct: ['riwayat_pend_bidang'],
        select: { riwayat_pend_bidang: true },
        orderBy: { riwayat_pend_bidang: 'asc' }
      })
    ]);

    const responseData = {
      jenisPtk: jenisPtkRes.map(item => item.jenis_ptk),
      statusKepegawaian: statusRes.map(item => item.status_kepegawaian),
      mapel: mapelRes.map(item => item.riwayat_sertifikasi),
      jurusan: jurusanRes.map(item => item.riwayat_pend_bidang),
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error fetching PTK Metadata:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data referensi" },
      { status: 500 }
    );
  }
}