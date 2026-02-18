import { NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  buildPtkQuery,
  PTK_QUERY_TYPE,
} from "@/app/api/ptk/[nik]/queryBuilder";
import { formatTerpusat, formatPelita } from "@/lib/formatPTKDetails";

export async function GET(request, { params }) {
  try {
    const { nik } = await params;

    if (!nik) {
      return NextResponse.json({ error: "NIK wajib diisi" }, { status: 400 });
    }

    // 1. Build Query Objects
    const qProfil = buildPtkQuery({ type: PTK_QUERY_TYPE.PROFIL, nik });
    const qRiwayat = buildPtkQuery({ type: PTK_QUERY_TYPE.RIWAYAT, nik });
    const qAlumni = buildPtkQuery({ type: PTK_QUERY_TYPE.ALUMNI, nik });

    // 2. Eksekusi Parallel (Direct Pool)
    const [profilRes, pelatihanRes, alumniRes] = await Promise.all([
      pool.query(qProfil.sql, qProfil.values),
      pool.query(qRiwayat.sql, qRiwayat.values),
      pool.query(qAlumni.sql, qAlumni.values),
    ]);

    // 3. Validasi
    if (profilRes.rows.length === 0) {
      return NextResponse.json(
        { error: "PTK tidak ditemukan" },
        { status: 404 },
      );
    }

    // 4. Extract Data Raw
    const ptk = profilRes.rows[0];
    const listPelatihan = pelatihanRes.rows;
    const alumni = alumniRes.rows.length > 0 ? alumniRes.rows[0] : null;

    // 5. Formatting Logic
    const responseData = {
      terpusat: formatTerpusat(ptk, listPelatihan),
      pelita: formatPelita(ptk, listPelatihan, alumni),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error API Integrasi:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
