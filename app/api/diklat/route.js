import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    // Filter Tambahan
    const rumpunId = searchParams.get('rumpun');
    const modeId = searchParams.get('mode'); // Daring/Luring
    const year = searchParams.get('year');

    let baseQuery = `
      SELECT 
        md.id,
        md.title,
        md.start_date,
        md.end_date,
        md.total_jp,
        md.course_code,
        rt.topic_name as rumpun,
        rm.mode_name as moda,
        COUNT(da.id) as total_peserta
      FROM master_diklat md
      LEFT JOIN ref_sub_topik rst ON md.sub_topic_id = rst.id
      LEFT JOIN ref_topik rt ON rst.topic_id = rt.id
      LEFT JOIN ref_mode rm ON md.mode_id = rm.id
      LEFT JOIN data_alumni da ON md.id = da.id_diklat
      WHERE 1=1
    `;

    const values = [];
    let counter = 1;

    if (search) {
      baseQuery += ` AND md.title ILIKE $${counter}`;
      values.push(`%${search}%`); counter++;
    }
    if (rumpunId && rumpunId !== 'ALL') {
      baseQuery += ` AND rt.id = $${counter}`;
      values.push(rumpunId); counter++;
    }
    if (year) {
      baseQuery += ` AND EXTRACT(YEAR FROM md.start_date) = $${counter}`;
      values.push(year); counter++;
    }

    // Group By wajib karena ada fungsi COUNT
    baseQuery += ` 
      GROUP BY md.id, md.title, md.start_date, md.end_date, md.total_jp, md.course_code, rt.topic_name, rm.mode_name
      ORDER BY md.start_date DESC
      LIMIT $${counter} OFFSET $${counter + 1}
    `;
    
    values.push(limit, offset);

    const res = await pool.query(baseQuery, values);
    
    // Hitung Total Data (Buat Pagination) - Query terpisah biar ringan
    const countRes = await pool.query(`SELECT COUNT(*) as total FROM master_diklat`);
    
    return NextResponse.json({
      data: res.rows,
      meta: {
        total: parseInt(countRes.rows[0].total),
        page,
        limit
      }
    });

  } catch (error) {
    console.error("Error API Diklat:", error);
    return NextResponse.json({ error: 'Gagal' }, { status: 500 });
  }
}