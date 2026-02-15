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

    const { sql, values } = buildPtkQuery({
      type: PTK_QUERY_TYPE.PROFIL,
      nik: nik,
    });

    // 3. Eksekusi Query ke Database
    // Gunakan sql dan values yang dihasilkan builder
    const profilRes = await pool.query(sql, values);

    if (profilRes.rows.length === 0) {
      return NextResponse.json(
        { error: "PTK tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      profil: profilRes.rows[0],
    });
  } catch (error) {
    console.error("Error Detail PTK:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
