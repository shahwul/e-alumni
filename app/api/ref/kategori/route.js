import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 

export async function GET() {
  try {
    const kategori = await prisma.ref_kategori.findMany({
      select: {
        id: true,
        origin_id: true,
        category_name: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return NextResponse.json(kategori);
  } catch (error) {
    console.error("Error API Kategori:", error);
    return NextResponse.json(
      { error: "Gagal ambil data kategori" },
      { status: 500 },
    );
  }
}
