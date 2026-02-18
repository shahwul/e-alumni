import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 
import {
  fetchPtkData, 
  PTK_QUERY_TYPE,
} from "../queryBuilder"; 
import { formatTerpusat, formatPelita } from "@/lib/formatPTKDetails";

export async function GET(request, { params }) {
  try {
    const { nik } = await params;

    if (!nik) {
      return NextResponse.json({ error: "NIK wajib diisi" }, { status: 400 });
    }
    const [ptk, listPelatihan, alumni] = await Promise.all([
      fetchPtkData(prisma, PTK_QUERY_TYPE.PROFIL, nik),
      fetchPtkData(prisma, PTK_QUERY_TYPE.RIWAYAT, nik),
      fetchPtkData(prisma, PTK_QUERY_TYPE.ALUMNI, nik),
    ]);
    if (!ptk) {
      return NextResponse.json(
        { error: "PTK tidak ditemukan" },
        { status: 404 },
      );
    }
    const responseData = {
      terpusat: formatTerpusat(ptk, listPelatihan),
      pelita: formatPelita(ptk, listPelatihan, alumni),
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error API Integrasi:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}