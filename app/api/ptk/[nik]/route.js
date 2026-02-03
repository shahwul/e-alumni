import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request, { params }) {
  try {
    // 1. Ambil NIK dari URL (Dynamic Route)
    const { nik } = await params;

    if (!nik) {
      return NextResponse.json({ error: "NIK wajib diisi" }, { status: 400 });
    }

    // ==========================================
    // QUERY 1: PROFIL LENGKAP (PTK + SEKOLAH + WILAYAH)
    // ==========================================
    // Saya sesuaikan kolomnya pakai 'nama_ptk' dan 'npsn' sesuai kodemu.
    // Saya kasih alias 'as nama' biar frontend gak perlu diubah.
    const profilSql = `
      SELECT 
        dp.nik,
        dp.nama_ptk, 
        dp.status_kepegawaian,
        dp.npsn,
        sp.nama,
        rw.kecamatan,
        rw.kabupaten
      FROM data_ptk dp
      LEFT JOIN satuan_pendidikan sp ON dp.npsn = sp.npsn
      LEFT JOIN ref_wilayah rw ON TRIM(sp.kode_kecamatan) = TRIM(rw.kode_kecamatan)
      WHERE dp.nik = $1
    `;
    const profilRes = await pool.query(profilSql, [nik]);

    if (profilRes.rows.length === 0) {
      return NextResponse.json(
        { error: "PTK tidak ditemukan" },
        { status: 404 },
      );
    }

    // ==========================================
    // QUERY 2: HISTORY DIKLAT (VERSI KAMU YANG UDAH BENER)
    // ==========================================
    const historySql = `
      SELECT 
        md.id as diklat_id,
        md.course_code,
        md.title as judul_diklat,
        md.start_date,
        md.end_date,
        md.total_jp,
        md.location,
        da.status_kelulusan,
        da.no_sertifikat,
        da.nilai_akhir,
        cat.category_name, -- Kalau mau dipake di UI
        mode.mode_name     -- Kalau mau dipake di UI
      FROM data_alumni da
      JOIN master_diklat md ON da.id_diklat = md.id
      LEFT JOIN ref_kategori cat ON md.category_id = cat.id
      LEFT JOIN ref_mode mode ON md.mode_id = mode.id
      WHERE da.nik = $1
      ORDER BY md.start_date DESC
    `;
    const historyRes = await pool.query(historySql, [nik]);

    // ==========================================
    // RETURN DATA GABUNGAN
    // ==========================================
    return NextResponse.json({
      profil: profilRes.rows[0],
      history: historyRes.rows,
    });
  } catch (error) {
    console.error("Error Detail PTK:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
