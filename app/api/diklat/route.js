import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// ============================================================================
// PUT: UPDATE DATA DIKLAT
// ============================================================================
export async function PUT(request) {
  try {
    const data = await request.json();
    
    // 1. Ambil ID dan pisahkan data
    const { id, ...body } = data;

    // 2. Blacklist / Sanitasi Kolom
    // Kita harus membuang properti yang bukan nama kolom di tabel 'master_diklat'
    // agar tidak terjadi error: column "xyz" does not exist.
    const nonColumnKeys = [
        'rumpun', 'topic_name', 
        'sub_rumpun', 'sub_topic_name', 
        'moda', 'mode_name', 
        'total_peserta', 
        'nama_sekolah' // jika ada sisa join
    ];

    // Hapus key yang dilarang
    nonColumnKeys.forEach(key => delete body[key]);

    // 3. Build Dynamic Query
    const setClauses = [];
    const values = [];
    let counter = 1;

    for (const [key, value] of Object.entries(body)) {
      // Pastikan value tidak undefined (null boleh)
      if (value !== undefined) {
          setClauses.push(`${key} = $${counter}`);
          values.push(value);
          counter++;
      }
    }

    // Jika tidak ada data yang valid untuk diupdate
    if (setClauses.length === 0) {
        return NextResponse.json({ message: 'No valid fields to update' });
    }

    values.push(id); // Parameter terakhir untuk WHERE id = ...
    
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

// ============================================================================
// GET: AMBIL LIST DIKLAT (FILTER & PAGINATION)
// ============================================================================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination Params
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;
    const search = searchParams.get('search') || '';

    // Filter Params
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const rumpunId = searchParams.get('rumpun');
    const subRumpunId = searchParams.get('sub_rumpun');

    // Array Params
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

    // ---------------------------------------------------------
    // 1. MEMBANGUN WHERE CLAUSE (Dipakai untuk Data & Count)
    // ---------------------------------------------------------
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

    // Filter Rumpun (Join Table Logic)
    // Asumsi: Filter dropdown mengirimkan ID topik (rt.id)
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

    // ---------------------------------------------------------
    // 2. QUERY UTAMA (SELECT DATA)
    // ---------------------------------------------------------
    // PENTING: Select md.topic_id, sub_topic_id, mode_id agar form edit bisa set default value dropdown
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
        md.education_level_id, -- Pastikan kolom ini ada jika difilter
        md.occupation_id, -- Pastikan kolom ini ada jika difilter
        
        -- ID JOIN (Penting untuk Edit Mode)
        md.sub_topic_id,
        rst.topic_id, -- Ambil topic_id dari relasi sub_topik
        md.mode_id,

        -- Display Names
        rt.topic_name,
        rst.sub_topic_name,
        rm.mode_name as moda,
        rjs.level_name as sasaran_jenjang,
        rjsb.occupation_name as sasaran_jabatan,
        
        -- Aggregates
        COUNT(da.id) as total_peserta
      FROM master_diklat md
      LEFT JOIN ref_jenjang_sasaran rjs ON md.education_level_id = rjs.id
      LEFT JOIN ref_jabatan_sasaran rjsb ON md.occupation_id = rjsb.id
      LEFT JOIN ref_sub_topik rst ON md.sub_topic_id = rst.id
      LEFT JOIN ref_topik rt ON rst.topic_id = rt.id
      LEFT JOIN ref_mode rm ON md.mode_id = rm.id
      LEFT JOIN data_alumni da ON md.id = da.id_diklat
      
      ${whereClause}
      
      GROUP BY 
        md.id, rjs.id, rjsb.id, rt.id, rst.id, rm.id,
        rt.topic_name, rst.sub_topic_name, rm.mode_name, rjs.level_name, rjsb.occupation_name
      ORDER BY md.start_date DESC
      LIMIT $${counter} OFFSET $${counter + 1}
    `;

    // Tambahkan Limit & Offset ke values
    const dataValues = [...values, limit, offset];
    
    // Eksekusi Data Query
    const res = await pool.query(dataQuery, dataValues);

    // ---------------------------------------------------------
    // 3. QUERY TOTAL (COUNT UNTUK PAGINATION)
    // ---------------------------------------------------------
    // Kita harus join tabel yang sama dengan filter agar count-nya akurat
    const countQuery = `
      SELECT COUNT(DISTINCT md.id) as total 
      FROM master_diklat md
      LEFT JOIN ref_sub_topik rst ON md.sub_topic_id = rst.id
      LEFT JOIN ref_topik rt ON rst.topic_id = rt.id
      LEFT JOIN ref_mode rm ON md.mode_id = rm.id
      ${whereClause}
    `;

    // Gunakan values yang sama dengan filter (tanpa limit/offset)
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