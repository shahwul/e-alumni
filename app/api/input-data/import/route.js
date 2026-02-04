import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { id_diklat, peserta } = await request.json();

    if (!peserta || peserta.length === 0) {
        return NextResponse.json({ error: 'Data kosong' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const p of peserta) {
        await client.query(`
          INSERT INTO data_alumni (
            id_diklat, nama_peserta, nik, snapshot_nama_sekolah, npsn, 
            snapshot_jabatan, snapshot_pangkat, status_kelulusan
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Lulus') 
        `, [
            id_diklat, 
            p.Nama, 
            p.NIK, 
            p.sekolah_auto, 
            p.NPSN,
            p.Jabatan,  // Masuk ke snapshot_jabatan
            p.Golongan  // Masuk ke snapshot_pangkat
        ]);
      }

      await client.query('COMMIT');
      return NextResponse.json({ success: true, count: peserta.length });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

  } catch (error) {
    return NextResponse.json({ error: 'Gagal import data' }, { status: 500 });
  }
}