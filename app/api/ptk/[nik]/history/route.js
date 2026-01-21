import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  try {
    // 1. Ambil NIK dari URL (Dynamic Route)
    // Await params karena di Next.js terbaru params itu Promise
    const { nik } = await params;

    if (!nik) {
      return NextResponse.json({ error: 'NIK wajib diisi' }, { status: 400 });
    }

    // 2. Query History Diklat (Join Tabel Alumni & Master Diklat)
    // Kita urutkan dari tahun terbaru (DESC)
    const query = `
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
        cat.category_name,
        mode.mode_name
      FROM data_alumni da
      JOIN master_diklat md ON da.id_diklat = md.id
      LEFT JOIN ref_kategori cat ON md.category_id = cat.id
      LEFT JOIN ref_mode mode ON md.mode_id = mode.id
      WHERE da.nik = $1
      ORDER BY md.start_date DESC
    `;

    const res = await pool.query(query, [nik]);

    // 3. (Opsional) Ambil Biodata Singkat buat Header
    const bioQuery = `SELECT nama_ptk, npsn FROM data_ptk WHERE nik = $1`;
    const bioRes = await pool.query(bioQuery, [nik]);
    const biodata = bioRes.rows[0] || {};

    return NextResponse.json({
      ptk: biodata,
      history: res.rows
    });

  } catch (error) {
    console.error("Error Get History:", error);
    return NextResponse.json({ error: 'Gagal mengambil history diklat' }, { status: 500 });
  }
}