import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // 1. Tangkap Parameter Filter
  const kabCode = searchParams.get('kab'); 
  const kecName = searchParams.get('kec'); 
  // Default tahun sekarang jika kosong
  const yearParam = searchParams.get('year') || new Date().getFullYear().toString();

  try {
    // --- SETUP WHERE CLAUSE (FILTER WILAYAH) ---
    let whereClause = "WHERE 1=1";
    const values = [];
    let counter = 1;

    const KAB_MAP = {
      '34.01': 'KULON PROGO', '34.02': 'BANTUL', '34.03': 'GUNUNGKIDUL',
      '34.04': 'SLEMAN', '34.71': 'YOGYAKARTA'
    };

    if (kabCode && KAB_MAP[kabCode]) {
      whereClause += ` AND UPPER(kabupaten) LIKE $${counter}`;
      values.push(`%${KAB_MAP[kabCode]}%`); 
      counter++;
    }

    if (kecName) {
      whereClause += ` AND UPPER(kecamatan) = $${counter}`;
      values.push(kecName.toUpperCase()); 
      counter++;
    }

    // --- SETUP PARAMETER TAHUN ---
    // Kita simpan posisi index parameter tahun ($3 atau $4 dst)
    const yearIndex = counter;
    values.push(yearParam); 
    // counter++; // (Opsional, kalau ada param lain setelah ini)

    // --- QUERY RANKING (AKUMULATIF / TOTAL) ---
    // Ranking biasanya tetap menghitung total prestasi (kumulatif), 
    // tapi kalau mau difilter tahun juga, tambahkan: AND EXTRACT(YEAR FROM end_date) = $${yearIndex}
    let rankingQuery = "";
    let rankingTitle = "";

    if (kecName) {
        rankingTitle = `Ranking Sekolah di ${kecName}`;
        rankingQuery = `SELECT nama_sekolah as name, COUNT(*) as value FROM mv_dashboard_analitik ${whereClause} AND is_sudah_pelatihan = true GROUP BY nama_sekolah ORDER BY value DESC LIMIT 5`;
    } else if (kabCode) {
        rankingTitle = `Ranking Kecamatan di ${KAB_MAP[kabCode]}`;
        rankingQuery = `SELECT kecamatan as name, COUNT(*) as value FROM mv_dashboard_analitik ${whereClause} AND is_sudah_pelatihan = true GROUP BY kecamatan ORDER BY value DESC LIMIT 5`;
    } else {
        rankingTitle = "Ranking Kabupaten (Jumlah Alumni)";
        rankingQuery = `SELECT kabupaten as name, COUNT(*) as value FROM mv_dashboard_analitik ${whereClause} AND is_sudah_pelatihan = true GROUP BY kabupaten ORDER BY value DESC`;
    }

    // --- EKSEKUSI QUERY PARALEL ---
    const [resStatus, resJabatan, resPtkAlumni, resKepsek, resTriwulan, resTahunan, resRanking] = await Promise.all([
      
      // 1. STATUS KEPEGAWAIAN (Snapshot Saat Ini) - Menggunakan values tanpa tahun (slice)
      pool.query(`SELECT COALESCE(status_kepegawaian, 'Lainnya') as name, COUNT(*) as value FROM mv_dashboard_analitik ${whereClause} GROUP BY 1 ORDER BY value DESC`, values.slice(0, yearIndex-1)),
      
      // 2. JABATAN (Snapshot Saat Ini)
      pool.query(`SELECT COALESCE(jabatan_ptk, 'Lainnya') as name, COUNT(*) as value FROM mv_dashboard_analitik ${whereClause} GROUP BY 1 ORDER BY value DESC LIMIT 5`, values.slice(0, yearIndex-1)),
      
      // 3. PTK vs ALUMNI (UPDATED: FILTER TAHUN)
      // Logic: Memisahkan "Lulusan Tahun Terpilih" vs "Sisanya"
      // Kita pakai parameter $yearIndex disini
      pool.query(`
        SELECT 
          CASE 
            WHEN is_sudah_pelatihan = true AND EXTRACT(YEAR FROM end_date) = $${yearIndex}::int THEN 'Alumni ' || $${yearIndex}
            ELSE 'Belum / Tahun Lain' 
          END as name,
          COUNT(*) as value
        FROM mv_dashboard_analitik 
        ${whereClause}
        GROUP BY 1
        ORDER BY 1 ASC 
      `, values), 
      // Note: ORDER BY 1 ASC supaya "Alumni 202X" (huruf A) selalu di index 0 (Warna Hijau di chart)

      // 4. KEPSEK vs GURU (Snapshot Saat Ini)
      pool.query(`SELECT CASE WHEN jabatan_ptk ILIKE '%Kepala Sekolah%' THEN 'Kepala Sekolah' ELSE 'Guru' END as name, COUNT(*) as value FROM mv_dashboard_analitik ${whereClause} GROUP BY 1`, values.slice(0, yearIndex-1)),

      // 5. TREN TRIWULAN (FILTER TAHUN AKTIF)
      pool.query(`
        SELECT 'Q' || EXTRACT(QUARTER FROM end_date) as name, COUNT(*) as alumni
        FROM mv_dashboard_analitik 
        ${whereClause} 
        AND is_sudah_pelatihan = true 
        AND end_date IS NOT NULL
        AND EXTRACT(YEAR FROM end_date) = $${yearIndex}::int
        GROUP BY 1 ORDER BY 1
      `, values),

      // 6. TREN TAHUNAN (5 TAHUN TERAKHIR)
      pool.query(`
        SELECT CAST(EXTRACT(YEAR FROM end_date) AS VARCHAR) as name, COUNT(*) as alumni
        FROM mv_dashboard_analitik 
        ${whereClause} 
        AND is_sudah_pelatihan = true
        AND end_date IS NOT NULL
        AND EXTRACT(YEAR FROM end_date) BETWEEN ($${yearIndex}::int - 4) AND $${yearIndex}::int
        GROUP BY 1 ORDER BY 1 ASC
      `, values),

      // 7. RANKING
      pool.query(rankingQuery, values.slice(0, yearIndex-1))
    ]);

    // --- FORMAT OUTPUT ---
    // Mapping Triwulan agar Q1-Q4 selalu muncul meski 0
    const allQuarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const triwulanData = allQuarters.map(q => {
        const found = resTriwulan.rows.find(row => row.name === q);
        return { name: q, alumni: found ? Number(found.alumni) : 0 };
    });

    return NextResponse.json({
      statusKepegawaian: resStatus.rows,
      jabatan: resJabatan.rows,
      ptkVsAlumni: resPtkAlumni.rows,
      kepsekVsGuru: resKepsek.rows,
      trenTriwulan: triwulanData,
      trenTahunan: resTahunan.rows,
      ranking: { title: rankingTitle, items: resRanking.rows }
    });

  } catch (error) {
    console.error("Error API Stats:", error);
    return NextResponse.json({ error: 'Gagal mengambil data statistik' }, { status: 500 });
  }
}