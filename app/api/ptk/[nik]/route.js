import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  fetchPtkData,
  PTK_QUERY_TYPE,
} from "./queryBuilder";

export async function GET(request, { params }) {
  try {
    const { nik } = await params;

    if (!nik) {
      return NextResponse.json({ error: "NIK wajib diisi" }, { status: 400 });
    }

    const profilData = await fetchPtkData(prisma, PTK_QUERY_TYPE.PROFIL, nik);

    if (!profilData) {
      return NextResponse.json(
        { error: "PTK tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      profil: profilData,
    });

  } catch (error) {
    console.error("Error Detail PTK:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}