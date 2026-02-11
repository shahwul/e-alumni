import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { buildPTKQueryParts } from './queryBuilder';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 1. Panggil Builder
    const { 
        whereClause, 
        values, 
        orderByClause, 
        hasDiklatFilter, 
        modeFilter,
        page, 
        limit 
    } = buildPTKQueryParts(searchParams);

    // Guard Clause History
    if (!hasDiklatFilter && modeFilter === 'history') {
        return NextResponse.json({ meta: { page, limit, totalData: 0, totalPage: 0 }, data: [] });
    }

    // 2. Query Total
    const countQuery = `SELECT COUNT(DISTINCT mv.nik) as total FROM mv_dashboard_analitik mv ${whereClause}`;
    const countRes = await pool.query(countQuery, values);
    const totalData = parseInt(countRes.rows[0].total);
    const totalPage = Math.ceil(totalData / limit);

    // 3. Query Data Utama (Pagination Logic disini)
    const offset = (page - 1) * limit;
    // Counter values harus lanjut dari yang terakhir di builder
    const limitParamIndex = values.length + 1; 
    const offsetParamIndex = values.length + 2;

    const mainQuery = `
      SELECT * FROM (
          SELECT DISTINCT ON (mv.nik)
            mv.nik, mv.nama_ptk, mv.nama_sekolah, mv.bentuk_pendidikan as jenjang, mv.jenis_ptk, 
            mv.jabatan_ptk, mv.riwayat_pend_jenjang as pendidikan_terakhir, mv.riwayat_pend_bidang as pendidikan_bidang, 
            mv.is_kepala_sekolah, mv.kabupaten, mv.kecamatan, mv.status_kepegawaian, 
            mv.riwayat_sertifikasi as mapel, mv.pangkat_golongan, mv.usia_tahun, 
            mv.is_sudah_pelatihan, mv.judul_diklat, mv.start_date
          FROM mv_dashboard_analitik mv 
          ${whereClause}
          ORDER BY mv.nik, mv.start_date DESC NULLS LAST
      ) as sub
      ${orderByClause}
      LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}
    `;

    // Gabung values filter + pagination values
    const queryValues = [...values, limit, offset];
    
    const res = await pool.query(mainQuery, queryValues);

    return NextResponse.json({
      meta: { page, limit, totalData, totalPage },
      data: res.rows
    });

  } catch (error) {
    console.error("Error API PTK:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}