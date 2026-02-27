import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const tingkat = searchParams.get("tingkat") || "kabupaten";
        const parentCode = searchParams.get("parent_code");

        let rawData = [];

        if (tingkat === "kabupaten") {
            rawData = await prisma.$queryRawUnsafe(`
        SELECT 
          kabupaten AS id,
          kabupaten AS wilayah,
          bentuk_pendidikan,
          jenis_kelamin,
          CAST(COUNT(nik) AS INTEGER) AS jml
        FROM mv_dashboard_analitik
        WHERE kabupaten IS NOT NULL AND bentuk_pendidikan IS NOT NULL
        GROUP BY kabupaten, bentuk_pendidikan, jenis_kelamin
        ORDER BY kabupaten ASC
      `);
        } else if (tingkat === "kecamatan") {
            if (!parentCode) {
                return NextResponse.json({ error: "parent_code (kabupaten) is required" }, { status: 400 });
            }
            rawData = await prisma.$queryRawUnsafe(`
        SELECT 
          kecamatan AS id,
          kecamatan AS wilayah,
          bentuk_pendidikan,
          jenis_kelamin,
          CAST(COUNT(nik) AS INTEGER) AS jml
        FROM mv_dashboard_analitik
        WHERE kecamatan IS NOT NULL AND bentuk_pendidikan IS NOT NULL
          AND kabupaten = $1
        GROUP BY kecamatan, bentuk_pendidikan, jenis_kelamin
        ORDER BY kecamatan ASC
      `, parentCode);
        } else if (tingkat === "sekolah") {
            if (!parentCode) {
                return NextResponse.json({ error: "parent_code (kecamatan) is required" }, { status: 400 });
            }
            rawData = await prisma.$queryRawUnsafe(`
        SELECT 
          npsn_sekolah AS id,
          nama_sekolah AS wilayah,
          bentuk_pendidikan,
          jenis_kelamin,
          CAST(COUNT(nik) AS INTEGER) AS jml
        FROM mv_dashboard_analitik
        WHERE npsn_sekolah IS NOT NULL AND bentuk_pendidikan IS NOT NULL
          AND kecamatan = $1
        GROUP BY npsn_sekolah, nama_sekolah, bentuk_pendidikan, jenis_kelamin
        ORDER BY nama_sekolah ASC
      `, parentCode);
        } else {
            return NextResponse.json({ error: "Invalid tingkat parameter" }, { status: 400 });
        }

        const grouped = {};
        const bentukPendidikanSet = new Set();

        rawData.forEach(row => {
            const { id, wilayah, bentuk_pendidikan, jenis_kelamin, jml } = row;
            const cnt = Number(jml);

            bentukPendidikanSet.add(bentuk_pendidikan);

            if (!grouped[id]) {
                grouped[id] = {
                    id,
                    wilayah,
                    total_jml: 0,
                    total_l: 0,
                    total_p: 0,
                    details: {}
                };
            }

            const item = grouped[id];
            item.total_jml += cnt;
            if (jenis_kelamin === 'L') item.total_l += cnt;
            if (jenis_kelamin === 'P') item.total_p += cnt;

            if (!item.details[bentuk_pendidikan]) {
                item.details[bentuk_pendidikan] = { jml: 0, l: 0, p: 0 };
            }

            item.details[bentuk_pendidikan].jml += cnt;
            if (jenis_kelamin === 'L') item.details[bentuk_pendidikan].l += cnt;
            if (jenis_kelamin === 'P') item.details[bentuk_pendidikan].p += cnt;
        });

        const columns = Array.from(bentukPendidikanSet).sort();

        const data = Object.values(grouped);

        data.sort((a, b) => a.wilayah.localeCompare(b.wilayah));

        return NextResponse.json({ columns, data });

    } catch (error) {
        console.error("Error fetching rekap PTK:", error);
        return NextResponse.json(
            { error: "Failed to fetch rekap PTK" },
            { status: 500 }
        );
    }
}
