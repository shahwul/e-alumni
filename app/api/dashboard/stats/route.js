import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { KAB_CODE_TO_NAME } from "@/lib/constants";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const kabCode = searchParams.get('kab'); 
  const kecName = searchParams.get('kec'); 
  const yearParam = searchParams.get('year') || new Date().getFullYear().toString();

  try {
    const conditions = ["1=1"];
    const values = [];
    let i = 1;

    if (kabCode && KAB_CODE_TO_NAME[kabCode]) {
      conditions.push(`UPPER(kabupaten) LIKE $${i++}`);
      values.push(`%${KAB_CODE_TO_NAME[kabCode]}%`); 
    }

    if (kecName) {
      conditions.push(`UPPER(kecamatan) = $${i++}`);
      values.push(kecName.toUpperCase()); 
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const yearIdx = i; 
    const valuesWithYear = [...values, parseInt(yearParam)];

    let rankingTitle = "";
    let rankingSql = "";

    if (kecName) {
        rankingTitle = `Ranking Sekolah di ${kecName}`;
        rankingSql = `SELECT nama_sekolah as name, COUNT(*)::int as value FROM mv_dashboard_analitik ${whereClause} AND is_sudah_pelatihan = true GROUP BY 1 ORDER BY 2 DESC LIMIT 5`;
    } else if (kabCode) {
        rankingTitle = `Ranking Kecamatan di ${KAB_CODE_TO_NAME[kabCode]}`;
        rankingSql = `SELECT kecamatan as name, COUNT(*)::int as value FROM mv_dashboard_analitik ${whereClause} AND is_sudah_pelatihan = true GROUP BY 1 ORDER BY 2 DESC LIMIT 5`;
    } else {
        rankingTitle = "Ranking Kabupaten (Jumlah Alumni)";
        rankingSql = `SELECT kabupaten as name, COUNT(*)::int as value FROM mv_dashboard_analitik ${whereClause} AND is_sudah_pelatihan = true GROUP BY 1 ORDER BY 2 DESC`;
    }

    const [status, jabatan, ptkAlumni, kepsek, triwulan, tahunan, ranking] = await Promise.all([
      prisma.$queryRawUnsafe(`SELECT COALESCE(status_kepegawaian, 'Lainnya') as name, COUNT(*)::int as value FROM mv_dashboard_analitik ${whereClause} GROUP BY 1 ORDER BY 2 DESC`, ...values),

      prisma.$queryRawUnsafe(`SELECT COALESCE(jabatan_ptk, 'Lainnya') as name, COUNT(*)::int as value FROM mv_dashboard_analitik ${whereClause} GROUP BY 1 ORDER BY 2 DESC LIMIT 5`, ...values),

      prisma.$queryRawUnsafe(`
        SELECT 
          CASE 
            WHEN is_sudah_pelatihan = true AND EXTRACT(YEAR FROM end_date) = $${yearIdx} THEN 'Alumni ' || $${yearIdx}
            ELSE 'Belum / Tahun Lain' 
          END as name,
          COUNT(*)::int as value
        FROM mv_dashboard_analitik 
        ${whereClause}
        GROUP BY 1 ORDER BY 1 ASC 
      `, ...valuesWithYear),

      prisma.$queryRawUnsafe(`SELECT CASE WHEN jabatan_ptk ILIKE '%Kepala Sekolah%' THEN 'Kepala Sekolah' ELSE 'Guru' END as name, COUNT(*)::int as value FROM mv_dashboard_analitik ${whereClause} GROUP BY 1`, ...values),

      prisma.$queryRawUnsafe(`
        SELECT 'Q' || EXTRACT(QUARTER FROM end_date) as name, COUNT(*)::int as alumni
        FROM mv_dashboard_analitik 
        ${whereClause} AND is_sudah_pelatihan = true AND end_date IS NOT NULL AND EXTRACT(YEAR FROM end_date) = $${yearIdx}
        GROUP BY 1 ORDER BY 1
      `, ...valuesWithYear),

      prisma.$queryRawUnsafe(`
        SELECT CAST(EXTRACT(YEAR FROM end_date) AS VARCHAR) as name, COUNT(*)::int as alumni
        FROM mv_dashboard_analitik 
        ${whereClause} AND is_sudah_pelatihan = true AND end_date IS NOT NULL 
        AND EXTRACT(YEAR FROM end_date) BETWEEN ($${yearIdx} - 4) AND $${yearIdx}
        GROUP BY 1 ORDER BY 1 ASC
      `, ...valuesWithYear),

      prisma.$queryRawUnsafe(rankingSql, ...values)
    ]);

    const allQuarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const formattedTriwulan = allQuarters.map(q => {
        const found = triwulan.find(row => row.name === q);
        return { name: q, alumni: found ? found.alumni : 0 };
    });

    return NextResponse.json({
      statusKepegawaian: status,
      jabatan: jabatan,
      ptkVsAlumni: ptkAlumni,
      kepsekVsGuru: kepsek,
      trenTriwulan: formattedTriwulan,
      trenTahunan: tahunan,
      ranking: { title: rankingTitle, items: ranking }
    });

  } catch (error) {
    console.error("Error API Stats:", error);
    return NextResponse.json({ error: 'Gagal memuat statistik' }, { status: 500 });
  }
}