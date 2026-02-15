import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(request) {
  try {
    const data = await request.json();

    const { id, ...body } = data;

    const nonColumnKeys = [
        'rumpun', 'topic_name', 
        'sub_rumpun', 'sub_topic_name', 
        'moda', 'mode_name', 
        'total_peserta', 
        'nama_sekolah'
    ];

    nonColumnKeys.forEach(key => delete body[key]);

    const setClauses = [];
    const values = [];
    let counter = 1;

    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined) {
          setClauses.push(`${key} = $${counter}`);
          values.push(value);
          counter++;
      }
    }

    if (setClauses.length === 0) {
        return NextResponse.json({ message: 'No valid fields to update' });
    }

    values.push(id);
    
    const query = `
      UPDATE master_diklat
      SET ${setClauses.join(', ')}
      WHERE id = $${counter}
    `;

    await pool.query(query, values);

    return NextResponse.json({ message: 'Diklat updated successfully' });

  } catch (error) {
    console.error("Error updating diklat:", error);
    return NextResponse.json({ error: 'Gagal memperbarui diklat' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;
    const search = searchParams.get('search') || '';

    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const rumpunId = searchParams.get('rumpun');
    const subRumpunId = searchParams.get('sub_rumpun');

    const modaRaw = searchParams.get('moda');
    const kategoriRaw = searchParams.get('kategori');
    const programRaw = searchParams.get('program');
    const jenjangRaw = searchParams.get('jenjang');
    const jabatanRaw = searchParams.get('jabatan');

    const modaArray = modaRaw ? modaRaw.split(',') : [];
    const kategoriArray = kategoriRaw ? kategoriRaw.split(',') : [];
    const programArray = programRaw ? programRaw.split(',') : [];
    const jenjangArray = jenjangRaw ? jenjangRaw.split(',') : [];
    const jabatanArray = jabatanRaw ? jabatanRaw.split(',') : [];

    let whereClause = ` WHERE 1=1 `;
    const values = [];
    let counter = 1;

    if (search) {
      whereClause += ` AND md.title ILIKE $${counter}`;
      values.push(`%${search}%`); counter++;
    }

    if (startDate) {
      whereClause += ` AND md.start_date >= $${counter}`;
      values.push(startDate); counter++;
    }
    if (endDate) {
      whereClause += ` AND md.end_date <= $${counter}`;
      values.push(endDate); counter++;
    }

    if (rumpunId && rumpunId !== 'ALL') {
      whereClause += ` AND rt.id = $${counter}`;
      values.push(rumpunId); counter++;
    }
    if (subRumpunId && subRumpunId !== 'ALL') {
      whereClause += ` AND rst.id = $${counter}`;
      values.push(subRumpunId); counter++;
    }

    // Filter Arrays
    if (modaArray.length > 0) {
      whereClause += ` AND rm.mode_name = ANY($${counter})`;
      values.push(modaArray); counter++;
    }
    if (kategoriArray.length > 0) {
      whereClause += ` AND md.jenis_kegiatan::text = ANY($${counter})`;
      values.push(kategoriArray); counter++;
    }
    if (programArray.length > 0) {
      whereClause += ` AND md.jenis_program::text = ANY($${counter})`;
      values.push(programArray); counter++;
    }

    // Filter Text Arrays (Menggunakan OR ILIKE)
    if (jenjangArray.length > 0) {
        const conditions = jenjangArray.map((_, i) => `md.sasaran_jenjang ILIKE $${counter + i}`).join(' OR ');
        whereClause += ` AND (${conditions})`;
        jenjangArray.forEach(j => { values.push(`%${j}%`); });
        counter += jenjangArray.length;
    }
    if (jabatanArray.length > 0) {
        const conditions = jabatanArray.map((_, i) => `md.sasaran_jabatan ILIKE $${counter + i}`).join(' OR ');
        whereClause += ` AND (${conditions})`;
        jabatanArray.forEach(j => { values.push(`%${j}%`); });
        counter += jabatanArray.length;
    }

const dataQuery = `
      SELECT 
        md.id,
        md.title,
        md.start_date,
        md.end_date,
        md.total_jp,
        md.course_code,
        md.participant_limit,
        md.jenis_kegiatan,
        md.jenis_program,
        md.occupation_id,
        md.education_level_id,
        md.location,
        
        -- ID JOIN
        md.sub_topic_id,
        rst.topic_id,
        md.mode_id,

        -- Display Names
        rt.topic_name,
        rst.sub_topic_name,
        rm.mode_name as moda,
        rjs.level_name as sasaran_jenjang,
        rjsb.occupation_name as sasaran_jabatan,
        
        -- Aggregates (DIPERBAIKI DENGAN SUBQUERY)
        (
            SELECT COUNT(*) 
            FROM data_alumni da 
            WHERE da.id_diklat = md.id
        ) as total_peserta,
        
        (
            SELECT COUNT(*) 
            FROM diklat_kandidat dk 
            WHERE dk.diklat_id = md.id
        ) as total_kandidat

      FROM master_diklat md
      LEFT JOIN ref_jenjang_sasaran rjs ON md.education_level_id = rjs.id
      LEFT JOIN ref_jabatan_sasaran rjsb ON md.occupation_id = rjsb.id
      LEFT JOIN ref_sub_topik rst ON md.sub_topic_id = rst.id
      LEFT JOIN ref_topik rt ON rst.topic_id = rt.id
      LEFT JOIN ref_mode rm ON md.mode_id = rm.id

      ${whereClause}
      
      ORDER BY md.start_date DESC
      LIMIT $${counter} OFFSET $${counter + 1}
    `;

    const dataValues = [...values, limit, offset];

    const res = await pool.query(dataQuery, dataValues);

    const countQuery = `
      SELECT COUNT(DISTINCT md.id) as total 
      FROM master_diklat md
      LEFT JOIN ref_sub_topik rst ON md.sub_topic_id = rst.id
      LEFT JOIN ref_topik rt ON rst.topic_id = rt.id
      LEFT JOIN ref_mode rm ON md.mode_id = rm.id
      ${whereClause}
    `;

    const countRes = await pool.query(countQuery, values);
    
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
    return NextResponse.json({ error: 'Gagal memuat data diklat' }, { status: 500 });
  }
}