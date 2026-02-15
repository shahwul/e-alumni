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

    const [riwayatPelatihan, ptkProfil] = await Promise.all([
      fetchPtkData(prisma, PTK_QUERY_TYPE.RIWAYAT_DETAIL, nik),
      fetchPtkData(prisma, PTK_QUERY_TYPE.PROFIL, nik),
    ]);

    const ptkFull = ptkProfil || {};
    
    const biodata = {
      nama_ptk: ptkFull.nama_ptk || null,
      npsn: ptkFull.npsn || null,
    };

    return NextResponse.json({
      ptk: biodata,
      riwayatPelatihan: riwayatPelatihan, 
    });

  } catch (error) {
    console.error("Error Get History:", error);
    return NextResponse.json(
      { error: "Gagal mengambil history diklat" },
      { status: 500 },
    );
  }
}