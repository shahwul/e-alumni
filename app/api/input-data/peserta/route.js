import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// 1. GET: Ambil daftar peserta
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const diklatId = searchParams.get('diklat_id');
    const search = searchParams.get('search') || '';

    if (!diklatId) return NextResponse.json({ data: [] });

    let query = `
      SELECT id, nik, nama_peserta, npsn, snapshot_nama_sekolah, snapshot_jabatan, snapshot_pangkat, status_kelulusan 
      FROM data_alumni 
      WHERE id_diklat = $1 
    `;
    
    const values = [diklatId];

    if (search) {
      query += ` AND (nama_peserta ILIKE $2 OR nik ILIKE $2 OR snapshot_nama_sekolah ILIKE $2)`;
      values.push(`%${search}%`);
    }

    query += ` ORDER BY nama_peserta ASC`;

    const res = await pool.query(query, values);
    return NextResponse.json({ data: res.rows });

  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

// 2. PUT: Update data peserta
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, nama_peserta, nik, npsn, snapshot_nama_sekolah, snapshot_jabatan, snapshot_pangkat } = body;

    await pool.query(`
      UPDATE data_alumni 
      SET nama_peserta=$1, nik=$2, npsn=$3, snapshot_nama_sekolah=$4, snapshot_jabatan=$5, snapshot_pangkat=$6
      WHERE id=$7
    `, [nama_peserta, nik, npsn, snapshot_nama_sekolah, snapshot_jabatan, snapshot_pangkat, id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal update data' }, { status: 500 });
  }
}

// 3. DELETE (Sama seperti sebelumnya)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await pool.query(`DELETE FROM data_alumni WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal hapus data' }, { status: 500 });
  }
}