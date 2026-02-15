import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  fetchPtkData,
  PTK_QUERY_TYPE,
} from "../queryBuilder";

export async function GET(request, { params }) {
  try {
    const { nik } = await params;

    if (!nik) {
      return NextResponse.json({ error: "NIK wajib diisi" }, { status: 400 });
    }

    const [alumniData, ptkRows] = await Promise.all([
        fetchPtkData(prisma, PTK_QUERY_TYPE.ALUMNI, nik),
        prisma.data_ptk.findMany({
            where: { nik: nik },
            select: {
                nama_ptk: true,
                npsn: true
            },
            take: 1 
        })
    ]);

    return NextResponse.json({
      ptk: ptkRows,
      dataAlumni: alumniData, 
    });

  } catch (error) {
    console.error("Error Get History:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pelita" },
      { status: 500 },
    );
  }
}