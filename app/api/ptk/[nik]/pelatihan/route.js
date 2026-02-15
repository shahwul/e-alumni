import { NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  buildPtkQuery,
  PTK_QUERY_TYPE,
} from "@/app/api/ptk/[nik]/queryBuilder";

export async function GET(request, { params }) {
  try {
    const { nik } = await params;

    if (!nik) {
      return NextResponse.json({ error: "NIK wajib diisi" }, { status: 400 });
    }

    const qRiwayat = buildPtkQuery({
      type: PTK_QUERY_TYPE.RIWAYAT_DETAIL,
      nik,
    });

    const qBio = buildPtkQuery({
      type: PTK_QUERY_TYPE.PROFIL,
      nik,
    });
    const [riwayatRes, bioRes] = await Promise.all([
      pool.query(qRiwayat.sql, qRiwayat.values),
      pool.query(qBio.sql, qBio.values),
    ]);

    const ptkFull = bioRes.rows[0] || {};
    const biodata = {
      nama_ptk: ptkFull.nama_ptk,
      npsn: ptkFull.npsn,
    };

    return NextResponse.json({
      ptk: biodata,
      riwayatPelatihan: riwayatRes.rows,
    });
  } catch (error) {
    console.error("Error Get History:", error);
    return NextResponse.json(
      { error: "Gagal mengambil history diklat" },
      { status: 500 },
    );
  }
}
