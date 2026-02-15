import { NextResponse } from "next/server";
import pool from "@/lib/db"; 

export const revalidate = 3600; 

export async function GET() {
  try {
    const [jenisPtkResult, statusResult, mapelResult, jurusanResult] = await Promise.all([
      
      // 1. Ambil Jenis PTK Unik
      pool.query(`
        SELECT DISTINCT jenis_ptk 
        FROM data_ptk 
        WHERE jenis_ptk IS NOT NULL AND jenis_ptk != '' 
        ORDER BY jenis_ptk ASC
      `),

      // 2. Ambil Status Kepegawaian Unik
      pool.query(`
        SELECT DISTINCT status_kepegawaian 
        FROM data_ptk 
        WHERE status_kepegawaian IS NOT NULL AND status_kepegawaian != '' 
        ORDER BY status_kepegawaian ASC
      `),

      // 3. Ambil Mapel Unik
      pool.query(`
        SELECT DISTINCT riwayat_sertifikasi
        FROM data_ptk 
        WHERE riwayat_sertifikasi IS NOT NULL AND riwayat_sertifikasi != '' 
        ORDER BY riwayat_sertifikasi ASC
      `),

      // 4. Ambil Jurusan/Bidang Unik
      pool.query(`
        SELECT DISTINCT riwayat_pend_bidang
        FROM data_ptk 
        WHERE riwayat_pend_bidang IS NOT NULL AND riwayat_pend_bidang != '' 
        ORDER BY riwayat_pend_bidang ASC
      `)
    ]);

    // Format hasil query menjadi array string sederhana
    // Sesuaikan '.rows' tergantung library pool yang dipakai (pg biasanya return .rows)
    const responseData = {
      jenisPtk: jenisPtkResult.rows.map(row => row.jenis_ptk),
      statusKepegawaian: statusResult.rows.map(row => row.status_kepegawaian),
      mapel: mapelResult.rows.map(row => row.riwayat_sertifikasi),
      jurusan: jurusanResult.rows.map(row => row.riwayat_pend_bidang),
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error fetching PTK Metadata:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data referensi" },
      { status: 500 }
    );
  }
}