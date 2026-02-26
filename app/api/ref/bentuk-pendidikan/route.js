import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const bentukPendidikan = await prisma.satuan_pendidikan.findMany({
            where: {
                bentuk_pendidikan: { not: null },
            },
            select: {
                bentuk_pendidikan: true,
            },
            distinct: ['bentuk_pendidikan'],
            orderBy: {
                bentuk_pendidikan: 'asc',
            },
        });

        const data = bentukPendidikan.map((item) => item.bentuk_pendidikan).filter(Boolean);

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching bentuk pendidikan:", error);
        return NextResponse.json({ error: "Gagal mengambil data bentuk pendidikan" }, { status: 500 });
    }
}
