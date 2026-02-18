import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const query = `
      SELECT id, origin_id, category_name 
      FROM ref_kategori 
      ORDER BY id ASC
    `;

    const res = await pool.query(query);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error("Error API Kategori:", error);
    return NextResponse.json(
      { error: "Gagal ambil data kategori" },
      { status: 500 },
    );
  }
}
