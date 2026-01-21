import { NextResponse } from 'next/server';
import pool from '@/lib/db'; // Pastikan path koneksi db benar

export async function GET() {
  try {
    // 1. Query ambil data unik Kabupaten & Kecamatan
    // Kita urutkan biar rapi saat looping
    const query = `
      SELECT DISTINCT 
        kabupaten, 
        kecamatan 
      FROM ref_wilayah 
      ORDER BY kabupaten ASC, kecamatan ASC
    `;

    const res = await pool.query(query);
    const rows = res.rows;

    // 2. Logic Grouping (Mengubah Flat Data -> Nested JSON)
    // Tujuan: [{ kabupaten: "SLEMAN", kecamatan: ["DEPOK", "GAMPING", ...] }, ...]
    
    const groupedData = [];
    const map = new Map();

    rows.forEach(row => {
      // Trim() penting untuk menghapus spasi di database (misal 'SLEMAN   ')
      const kab = row.kabupaten?.trim(); 
      const kec = row.kecamatan?.trim();

      if (!kab) return;

      if (!map.has(kab)) {
        map.set(kab, []);
        groupedData.push({
          kabupaten: kab,
          kecamatan: map.get(kab)
        });
      }
      
      if (kec) {
        map.get(kab).push(kec);
      }
    });

    return NextResponse.json(groupedData);

  } catch (error) {
    console.error("Error API Wilayah:", error);
    return NextResponse.json({ error: 'Gagal ambil wilayah' }, { status: 500 });
  }
}