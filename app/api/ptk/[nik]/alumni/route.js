import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { nik } = await params;

    if (!nik) {
      return NextResponse.json({ error: "NIK wajib diisi" }, { status: 400 });
    }

    const alumniSql = `
      SELECT 
        id,
        id_diklat,
        status_kelulusan,
        no_sertifikat,
        nilai_akhir,
        snapshot_nama_sekolah,
        snapshot_jabatan,
        snapshot_pangkat,
        created_at,
        npsn,
        nama_peserta
      FROM data_alumni
      WHERE nik = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const alumniRes = await pool.query(alumniSql, [nik]);

    const alumniData = alumniRes.rows.length > 0 ? alumniRes.rows[0] : null;

    const bioQuery = `SELECT nama_ptk, npsn FROM data_ptk WHERE nik = $1`;
    const bioRes = await pool.query(bioQuery, [nik]);

    return NextResponse.json({
      ptk: bioRes.rows,
      dataAlumni: alumniData,
    });
  } catch {
    console.error("Error Get History:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pelita" },
      { status: 500 },
    );
  }
}
