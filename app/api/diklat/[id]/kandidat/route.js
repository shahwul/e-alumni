import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = await params; // ID Diklat

  try {
    const query = `
      SELECT 
        k.id as kandidat_id,
        k.nik,
        p.*,
        rw.kabupaten,
        rw.kecamatan,
        s.nama as nama_sekolah,
        k.status
      FROM diklat_kandidat k
      JOIN data_ptk p ON k.nik = p.nik
      JOIN satuan_pendidikan s ON p.npsn = s.npsn
      JOIN ref_wilayah rw ON s.kode_kecamatan = rw.kode_kecamatan
      WHERE k.diklat_id = $1
      ORDER BY p.nama_ptk ASC
    `;

    const res = await pool.query(query, [id]);
    return NextResponse.json({ data: res.rows });
  } catch (error) {
    console.error("Error fetch kandidat:", error);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

// DELETE: Hapus kandidat (Batalkan pengajuan)
export async function DELETE(request, { params }) {
    const { id } = params; // Ini ID Diklat
    const { searchParams } = new URL(request.url);
    const kandidatId = searchParams.get('kandidat_id');

    try {
        await pool.query('DELETE FROM diklat_kandidat WHERE id = $1', [kandidatId]);
        return NextResponse.json({ message: 'Kandidat dihapus' });
    } catch (error) {
        return NextResponse.json({ error: 'Gagal menghapus' }, { status: 500 });
    }
}