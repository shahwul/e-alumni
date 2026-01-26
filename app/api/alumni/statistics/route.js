import db from "@/lib/db";

const KABUPATEN_MAP = {
  "34.01": "Kab. Kulon Progo",
  "34.02": "Kab. Bantul",
  "34.03": "Kab. Gunungkidul",
  "34.04": "Kab. Sleman",
  "34.71": "Kota Yogyakarta",
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const kabupatenCode = searchParams.get("kabupaten_code");
    const kecamatan = searchParams.get("kecamatan");

    // Query statistik PTK
    let ptkQuery = "SELECT COUNT(*) as total FROM data_ptk WHERE status_kepegawaian = 'Aktif'";
    let params = [];

    if (kabupatenCode) {
      ptkQuery += " AND wilayah_code LIKE ?";
      params.push(`${kabupatenCode}%`);
    }

    if (kecamatan) {
      ptkQuery += " AND wilayah_name = ?";
      params.push(kecamatan);
    }

    const ptkResult = await db.query(ptkQuery, params);
    const ptkAktif = ptkResult[0]?.total || 0;

    // Query alumni diklat
    let alumniQuery =
      "SELECT COUNT(*) as total FROM diklat_alumni WHERE status = 'Selesai'";
    params = [];

    if (kabupatenCode) {
      alumniQuery +=
        " AND peserta_id IN (SELECT id FROM ptk WHERE wilayah_code LIKE ?)";
      params.push(`${kabupatenCode}%`);
    }

    if (kecamatan) {
      alumniQuery +=
        " AND peserta_id IN (SELECT id FROM ptk WHERE wilayah_name = ?)";
      params.push(kecamatan);
    }

    const alumniResult = await db.query(alumniQuery, params);
    const alumniDiklat = alumniResult[0]?.total || 0;

    // Query jabatan stats
    let jabatanQuery = `
      SELECT jabatan, COUNT(*) as value 
      FROM ptk 
      WHERE status = 'Aktif'
    `;
    params = [];

    if (kabupatenCode) {
      jabatanQuery += " AND wilayah_code LIKE ?";
      params.push(`${kabupatenCode}%`);
    }

    if (kecamatan) {
      jabatanQuery += " AND wilayah_name = ?";
      params.push(kecamatan);
    }

    jabatanQuery += " GROUP BY jabatan ORDER BY value DESC";

    const jabatanResult = await db.query(jabatanQuery, params);
    const jabatanStats = jabatanResult.map((row) => ({
      name: row.jabatan,
      value: row.value,
    }));

    // Query kepsek & guru count
    let kepsekQuery =
      "SELECT COUNT(*) as total FROM ptk WHERE status = 'Aktif' AND jabatan LIKE '%Kepala%'";
    let guruQuery =
      "SELECT COUNT(*) as total FROM ptk WHERE status = 'Aktif' AND jabatan LIKE '%Guru%'";
    params = [];

    if (kabupatenCode) {
      kepsekQuery += " AND wilayah_code LIKE ?";
      guruQuery += " AND wilayah_code LIKE ?";
      params = [`${kabupatenCode}%`];
    }

    if (kecamatan) {
      kepsekQuery += " AND wilayah_name = ?";
      guruQuery += " AND wilayah_name = ?";
      params = [kecamatan];
    }

    const kepsekResult = await db.query(kepsekQuery, params);
    const guruResult = await db.query(guruQuery, params);
    const totalKepsek = kepsekResult[0]?.total || 0;
    const totalGuru = guruResult[0]?.total || 0;

    // Query tren alumni per triwulan (tahun berjalan)
    const currentYear = new Date().getFullYear();
    let trenTriwulanQuery = `
      SELECT 
        CASE 
          WHEN MONTH(tgl_selesai) IN (1,2,3) THEN 'Q1'
          WHEN MONTH(tgl_selesai) IN (4,5,6) THEN 'Q2'
          WHEN MONTH(tgl_selesai) IN (7,8,9) THEN 'Q3'
          ELSE 'Q4'
        END as quarter,
        COUNT(*) as alumni
      FROM diklat_alumni
      WHERE YEAR(tgl_selesai) = ? AND status = 'Selesai'
    `;
    params = [currentYear];

    if (kabupatenCode) {
      trenTriwulanQuery +=
        " AND peserta_id IN (SELECT id FROM ptk WHERE wilayah_code LIKE ?)";
      params.push(`${kabupatenCode}%`);
    }

    if (kecamatan) {
      trenTriwulanQuery +=
        " AND peserta_id IN (SELECT id FROM ptk WHERE wilayah_name = ?)";
      params.push(kecamatan);
    }

    trenTriwulanQuery +=
      " GROUP BY quarter ORDER BY FIELD(quarter, 'Q1', 'Q2', 'Q3', 'Q4')";

    const trenTriwulanResult = await db.query(trenTriwulanQuery, params);
    const trenTriwulan = [
      { name: "Q1", alumni: 0 },
      { name: "Q2", alumni: 0 },
      { name: "Q3", alumni: 0 },
      { name: "Q4", alumni: 0 },
    ];

    trenTriwulanResult.forEach((row) => {
      const idx = trenTriwulan.findIndex((q) => q.name === row.quarter);
      if (idx !== -1) trenTriwulan[idx].alumni = row.alumni;
    });

    // Query tren alumni per tahun (5 tahun terakhir)
    let trenTahunanQuery = `
      SELECT YEAR(tgl_selesai) as tahun, COUNT(*) as alumni
      FROM diklat_alumni
      WHERE YEAR(tgl_selesai) >= ? AND status = 'Selesai'
    `;
    params = [currentYear - 4];

    if (kabupatenCode) {
      trenTahunanQuery +=
        " AND peserta_id IN (SELECT id FROM ptk WHERE wilayah_code LIKE ?)";
      params.push(`${kabupatenCode}%`);
    }

    if (kecamatan) {
      trenTahunanQuery +=
        " AND peserta_id IN (SELECT id FROM ptk WHERE wilayah_name = ?)";
      params.push(kecamatan);
    }

    trenTahunanQuery += " GROUP BY tahun ORDER BY tahun";

    const trenTahunanResult = await db.query(trenTahunanQuery, params);
    const trenTahunan = trenTahunanResult.map((row) => ({
      name: row.tahun.toString(),
      alumni: row.alumni,
    }));

    // Query ranking
    let ranking = [];

    if (!kabupatenCode) {
      // Ranking kabupaten
      const rankingQuery = `
        SELECT wilayah_code, COUNT(*) as total
        FROM diklat_alumni
        WHERE status = 'Selesai'
        AND peserta_id IN (SELECT id FROM ptk)
        GROUP BY wilayah_code
        ORDER BY total DESC
        LIMIT 5
      `;
      const rankingResult = await db.query(rankingQuery);
      ranking = rankingResult.map((row) => ({
        name: KABUPATEN_MAP[row.wilayah_code] || row.wilayah_code,
        value: row.total,
      }));
    } else if (kabupatenCode && !kecamatan) {
      // Ranking kecamatan
      const rankingQuery = `
        SELECT wilayah_name, COUNT(*) as total
        FROM diklat_alumni
        WHERE status = 'Selesai'
        AND peserta_id IN (
          SELECT id FROM ptk WHERE wilayah_code LIKE ?
        )
        GROUP BY wilayah_name
        ORDER BY total DESC
        LIMIT 5
      `;
      const rankingResult = await db.query(rankingQuery, [
        `${kabupatenCode}%`,
      ]);
      ranking = rankingResult.map((row) => ({
        name: row.wilayah_name,
        value: row.total,
      }));
    } else {
      // Ranking sekolah
      const rankingQuery = `
        SELECT s.nama_sekolah, COUNT(*) as total
        FROM diklat_alumni da
        JOIN ptk p ON da.peserta_id = p.id
        JOIN sekolah s ON p.sekolah_id = s.id
        WHERE da.status = 'Selesai'
        AND p.wilayah_name = ?
        GROUP BY s.nama_sekolah
        ORDER BY total DESC
        LIMIT 5
      `;
      const rankingResult = await db.query(rankingQuery, [kecamatan]);
      ranking = rankingResult.map((row) => ({
        name: row.nama_sekolah,
        value: row.total,
      }));
    }

    return Response.json({
      ptkAktif,
      alumniDiklat,
      totalGuru,
      totalKepsek,
      jabatanStats,
      trenTriwulan,
      trenTahunan,
      ranking,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return Response.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
