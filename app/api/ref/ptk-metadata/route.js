import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const revalidate = 3600;

export async function GET() {
  try {
    const [jenisPtkRes, statusRes, mapelRes, jurusanRes, pendidikanRes] = await Promise.all([
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
            { riwayat_sertifikasi_bidang_studi: null },
            { riwayat_sertifikasi_bidang_studi: "" }
          ]
        },
        distinct: ['riwayat_sertifikasi_bidang_studi'],
        select: { riwayat_sertifikasi_bidang_studi: true },
        orderBy: { riwayat_sertifikasi_bidang_studi: 'asc' }
      }),

      prisma.data_ptk.findMany({
        where: {
          NOT: [
            { riwayat_pendidikan_formal_bidang_studi: null },
            { riwayat_pendidikan_formal_bidang_studi: "" }
          ]
        },
        distinct: ['riwayat_pendidikan_formal_bidang_studi'],
        select: { riwayat_pendidikan_formal_bidang_studi: true },
        orderBy: { riwayat_pendidikan_formal_bidang_studi: 'asc' }
      }),
      prisma.data_ptk.findMany({
        where: {
          NOT: [
            { riwayat_pendidikan_formal_jenjang_pendidikan: null },
            { riwayat_pendidikan_formal_jenjang_pendidikan: "" }
          ]
        },
        distinct: ['riwayat_pendidikan_formal_jenjang_pendidikan'],
        select: { riwayat_pendidikan_formal_jenjang_pendidikan: true },
        orderBy: { riwayat_pendidikan_formal_jenjang_pendidikan: 'asc' }
      })
    ]);

    const responseData = {
      jenisPtk: jenisPtkRes.map(item => item.jenis_ptk),
      statusKepegawaian: statusRes.map(item => item.status_kepegawaian),
      mapel: mapelRes.map(item => item.riwayat_sertifikasi_bidang_studi),
      jurusan: jurusanRes.map(item => item.riwayat_pendidikan_formal_bidang_studi),
      pendidikan: pendidikanRes.map(item => item.riwayat_pendidikan_formal_jenjang_pendidikan),
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