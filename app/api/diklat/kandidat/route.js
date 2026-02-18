import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// POST: Simpan Kandidat (Bulk Insert)
export async function POST(request) {
  try {
    const { diklat_id, nik_list } = await request.json(); 

    if (!diklat_id || !nik_list || nik_list.length === 0) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Generate values ($1, $2), ($1, $3)...
    const values = [];
    const placeholders = [];
    
    nik_list.forEach((nik, index) => {
        values.push(nik);
        placeholders.push(`($1, $${index + 2})`); 
    });

    const finalValues = [diklat_id, ...values];

    const query = `
      INSERT INTO diklat_kandidat (diklat_id, nik)
      VALUES ${placeholders.join(', ')}
      ON CONFLICT (diklat_id, nik) DO NOTHING
    `;

    await pool.query(query, finalValues);

    return NextResponse.json({ message: 'Berhasil menambahkan kandidat' });

  } catch (error) {
    console.error("Error add candidates:", error);
    return NextResponse.json({ error: 'Gagal menyimpan data' }, { status: 500 });
  }
}

// GET: Ambil List Diklat Aktif (Untuk Dropdown Pilihan)
export async function GET(request) {
    try {
        // Ambil 50 diklat terbaru yg belum selesai (sesuaikan logic tanggal kalau perlu)
        const query = `
            SELECT id, title, start_date, participant_limit 
            FROM master_diklat 
            ORDER BY start_date DESC 
            LIMIT 50
        `;
        const res = await pool.query(query);
        return NextResponse.json({ data: res.rows });
    } catch (error) {
        return NextResponse.json({ data: [] });
    }
}