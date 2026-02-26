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
          w.kode_kabupaten AS id,
          w.kabupaten AS wilayah,
          s.bentuk_pendidikan,
          CAST(COUNT(s.npsn) AS INTEGER) AS jml
        FROM ref_wilayah w
        LEFT JOIN satuan_pendidikan s ON s.kode_kecamatan = w.kode_kecamatan
        WHERE s.bentuk_pendidikan IS NOT NULL
        GROUP BY w.kode_kabupaten, w.kabupaten, s.bentuk_pendidikan
        ORDER BY w.kabupaten ASC
      `);
    } else if (tingkat === "kecamatan") {
      if (!parentCode) {
        return NextResponse.json({ error: "parent_code (kode_kabupaten) is required" }, { status: 400 });
      }
      rawData = await prisma.$queryRawUnsafe(`
        SELECT 
          w.kode_kecamatan AS id,
          w.kecamatan AS wilayah,
          s.bentuk_pendidikan,
          CAST(COUNT(s.npsn) AS INTEGER) AS jml
        FROM ref_wilayah w
        LEFT JOIN satuan_pendidikan s ON s.kode_kecamatan = w.kode_kecamatan
        WHERE s.bentuk_pendidikan IS NOT NULL
          AND w.kode_kabupaten = $1
        GROUP BY w.kode_kecamatan, w.kecamatan, s.bentuk_pendidikan
        ORDER BY w.kecamatan ASC
      `, parentCode);
    } else if (tingkat === "sekolah") {
      if (!parentCode) {
        return NextResponse.json({ error: "parent_code (kode_kecamatan) is required" }, { status: 400 });
      }
      rawData = await prisma.$queryRawUnsafe(`
        SELECT 
          s.npsn AS id,
          s.nama AS wilayah,
          s.bentuk_pendidikan,
          1 AS jml
        FROM satuan_pendidikan s
        WHERE s.bentuk_pendidikan IS NOT NULL
          AND s.kode_kecamatan = $1
        ORDER BY s.nama ASC
      `, parentCode);
    } else {
      return NextResponse.json({ error: "Invalid tingkat parameter. Only kabupaten, kecamatan, or sekolah are allowed." }, { status: 400 });
    }

    // Pivot data in JavaScript
    const grouped = {};
    const bentukPendidikanSet = new Set();

    rawData.forEach(row => {
      // Handle BigInt jika postgres mengembalikan COUNT sebagai BigInt
      const jml = typeof row.jml === "bigint" ? Number(row.jml) : Number(row.jml || 0);
      const { id, wilayah, bentuk_pendidikan } = row;

      bentukPendidikanSet.add(bentuk_pendidikan);

      if (!grouped[id]) {
        grouped[id] = {
          id,
          wilayah,
          total_jml: 0,
          details: {}
        };
      }

      const item = grouped[id];
      item.total_jml += jml;

      if (!item.details[bentuk_pendidikan]) {
        item.details[bentuk_pendidikan] = 0;
      }
      item.details[bentuk_pendidikan] += jml;
    });

    const columns = Array.from(bentukPendidikanSet).sort();

    const data = Object.values(grouped);

    data.sort((a, b) => a.wilayah.localeCompare(b.wilayah));

    return NextResponse.json({ columns, data });

  } catch (error) {
    console.error("Error fetching rekap sekolah:", error);
    return NextResponse.json(
      { error: "Failed to fetch rekap sekolah" },
      { status: 500 }
    );
  }
}
