// app/api/diklat/[id]/kandidat/route.js

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request, { params }) {
  const { id } = await params; // ID Diklat

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Ambil semua kandidat untuk diklat ini
    const getCandidatesQuery = `
      SELECT dk.nik, dp.nama_ptk, dp.npsn as npsn_sekolah, dp.jabatan_ptk, dp.pangkat_golongan
      FROM diklat_kandidat dk
      JOIN data_ptk dp ON dk.nik = dp.nik
      JOIN satuan_pendidikan sp ON dp.npsn = sp.npsn
      WHERE diklat_id = $1
    `;
    const candidates = await client.query(getCandidatesQuery, [id]);

    if (candidates.rowCount === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Tidak ada kandidat untuk disimpan' }, { status: 400 });
    }

    // 2. Insert ke tabel data_alumni (Bulk Insert)
    // Kita gunakan ON CONFLICT DO NOTHING biar kalau user klik simpan 2x, data gak dobel
    const insertQuery = `
      INSERT INTO data_alumni (
        id_diklat, nik, nama_peserta, npsn, snapshot_jabatan, snapshot_pangkat, status_kelulusan
      ) VALUES ($1, $2, $3, $4, $5, $6, 'Lulus')
      ON CONFLICT (id_diklat, nik) DO NOTHING
    `;

    for (const cand of candidates.rows) {
      await client.query(insertQuery, [
        id, 
        cand.nik, 
        cand.nama_ptk, 
        cand.npsn_sekolah, 
        cand.jabatan_ptk, 
        cand.pangkat_golongan
      ]);
    }

    // 3. Opsional: Hapus dari tabel kandidat setelah dipindah (Biar bersih)
    await client.query('DELETE FROM diklat_kandidat WHERE diklat_id = $1', [id]);

    await client.query('COMMIT');

    return NextResponse.json({ 
        success: true, 
        message: `Berhasil memindahkan ${candidates.rowCount} kandidat ke daftar alumni.` 
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error Simpan Kandidat:", error);
    return NextResponse.json({ error: 'Gagal menyimpan data' }, { status: 500 });
  } finally {
    client.release();
  }
}