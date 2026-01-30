import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // PAGINATION PARAMS
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 25; 
    const offset = (page - 1) * limit;

    // SORTING PARAMS
    const sortBy = searchParams.get('sort_by') || 'nama';
    const sortOrder = searchParams.get('sort_order') || 'asc';

    // FILTER PARAMS (Sama seperti sebelumnya)
    const search = searchParams.get('search') || '';         
    const sekolah = searchParams.get('sekolah') || '';       
    const jenjang = searchParams.get('jenjang') || '';       
    const status = searchParams.get('status') || '';         
    const kabupaten = searchParams.get('kabupaten') || '';
    const kecamatan = searchParams.get('kecamatan') || '';
    const kabupatenArray = kabupaten ? kabupaten.split(',') : []; 
    const kecamatanArray = kecamatan ? kecamatan.split(',') : []; 
    const rumpunId = searchParams.get('rumpun');             
    const subRumpunId = searchParams.get('sub_rumpun');
    const kategoriId = searchParams.get('kategori_id');   
    const kategoriParam = searchParams.get('kategori');
    const programParam = searchParams.get('program');
    const judulDiklatRaw = searchParams.get('judul_diklat'); 
    let judulDiklatArray = [];
    if (judulDiklatRaw) {
        judulDiklatArray = judulDiklatRaw.includes('||') ? judulDiklatRaw.split('||') : judulDiklatRaw.split(','); 
    } 
    const modeFilter = searchParams.get('mode_filter') || 'history'; 
    const startDate = searchParams.get('start_date'); 
    const endDate = searchParams.get('end_date');     

    // ==========================================
    // 1. BANGUN WHERE CLAUSE (FILTER)
    // ==========================================
    // Kita pisahkan logika WHERE agar bisa dipakai di Query Data & Query Total
    
    let whereClause = ` WHERE 1=1 `;
    const values = [];
    let counter = 1;

    if (search) {
      whereClause += ` AND (mv.nama_ptk ILIKE $${counter} OR mv.nik ILIKE $${counter})`;
      values.push(`%${search}%`); counter++;
    }
    if (sekolah) {
      whereClause += ` AND mv.nama_sekolah ILIKE $${counter}`;
      values.push(`%${sekolah}%`); counter++;
    }
    if (jenjang && jenjang !== 'ALL') {
      whereClause += ` AND mv.bentuk_pendidikan = $${counter}`;
      values.push(jenjang); counter++;
    }
    if (kabupatenArray.length > 0) {
       const placeholders = kabupatenArray.map((_, i) => `$${counter + i}`).join(',');
       whereClause += ` AND UPPER(mv.kabupaten) IN (${placeholders})`;
       kabupatenArray.forEach(k => values.push(k.toUpperCase())); counter += kabupatenArray.length;
    }
    if (kecamatanArray.length > 0) {
       const placeholders = kecamatanArray.map((_, i) => `$${counter + i}`).join(',');
       whereClause += ` AND UPPER(mv.kecamatan) IN (${placeholders})`;
       kecamatanArray.forEach(k => values.push(k.toUpperCase())); counter += kecamatanArray.length;
    }
    if (startDate && endDate) {
       const isEligibleWithJudul = modeFilter === 'eligible' && judulDiklatArray.length > 0;
       if (!isEligibleWithJudul) {
          whereClause += ` AND mv.start_date >= $${counter} AND mv.end_date <= $${counter + 1}`;
          values.push(startDate); values.push(endDate); counter += 2;
       }
    }
    if (status === 'sudah') {
      whereClause += ` AND mv.is_sudah_pelatihan = TRUE`;
    } else if (status === 'belum') {
      whereClause += ` AND mv.is_sudah_pelatihan = FALSE`;
    }
    if (rumpunId && rumpunId !== 'ALL') {
      whereClause += ` AND mv.rumpun_id = $${counter}`; 
      values.push(rumpunId); counter++;
    }
    if (subRumpunId && subRumpunId !== 'ALL') {
      whereClause += ` AND mv.sub_topic_id = $${counter}`;
      values.push(subRumpunId); counter++;
    }
    if (kategoriId && kategoriId !== 'ALL') {
      whereClause += ` AND mv.kategori_id = $${counter}`;
      values.push(kategoriId); counter++;
    }

    // Logic Master Diklat Filter
    const hasDiklatFilter = judulDiklatArray.length > 0 || kategoriParam || programParam;
    if (hasDiklatFilter) {
        let clause = '';
        let extraConditions = '';
        if (kategoriParam) extraConditions += ` AND md.jenis_kegiatan::text = '${kategoriParam}'`;
        if (programParam) extraConditions += ` AND md.jenis_program::text = '${programParam}'`;
        
        let titleCondition = '';
        if (judulDiklatArray.length > 0) {
             const placeholders = judulDiklatArray.map((_, i) => `$${counter + i}`).join(',');
             titleCondition = ` AND md.title = ANY(ARRAY[${placeholders}])`;
             judulDiklatArray.forEach(t => values.push(t.trim()));
             counter += judulDiklatArray.length;
        }

        if (modeFilter === 'eligible') {
            let dateSubQuery = '';
            if (startDate && endDate) dateSubQuery = ` AND md.start_date >= '${startDate}' AND md.end_date <= '${endDate}' `;
            clause = ` AND mv.nik NOT IN (SELECT da.nik FROM data_alumni da JOIN master_diklat md ON da.id_diklat = md.id WHERE da.status_kelulusan ILIKE 'Lulus' ${titleCondition} ${extraConditions} ${dateSubQuery})`;
        } else {
            clause = ` AND EXISTS (SELECT 1 FROM data_alumni da JOIN master_diklat md ON da.id_diklat = md.id WHERE da.nik::text = mv.nik::text AND da.status_kelulusan ILIKE 'Lulus' ${titleCondition} ${extraConditions})`;
        }
        whereClause += clause;
    }

    // ==========================================
    // 2. QUERY TOTAL DATA (Untuk Pagination)
    // ==========================================
    const countQuery = `SELECT COUNT(DISTINCT mv.nik) as total FROM mv_dashboard_analitik mv ${whereClause}`;
    const countRes = await pool.query(countQuery, values);
    const totalData = parseInt(countRes.rows[0].total);
    const totalPage = Math.ceil(totalData / limit);

    // ==========================================
    // 3. QUERY DATA UTAMA (FIX DISTINCT ERROR)
    // ==========================================
    // Strategi: 
    // 1. Inner Query: Ambil DISTINCT ON (nik) dengan ORDER BY nik (Wajib match).
    // 2. Outer Query: Ambil hasil inner, lalu ORDER BY sesuai request user (nama, sekolah, dll).
    
    // Tentukan sorting user
    let outerOrderBy = `ORDER BY sub.nama_ptk ASC`; // Default
    const dir = sortOrder === 'desc' ? 'DESC' : 'ASC';

    if (sortBy === 'nama') {
        outerOrderBy = `ORDER BY sub.nama_ptk ${dir}`;
    } else if (sortBy === 'sekolah') {
        outerOrderBy = `ORDER BY sub.nama_sekolah ${dir}`;
    } else if (sortBy === 'status') {
        outerOrderBy = `ORDER BY sub.status_kepegawaian ${dir}`;
    } else if (sortBy === 'pelatihan') {
        // 'sudah' (true) vs 'belum' (false)
        const boolDir = sortOrder === 'sudah' ? 'DESC' : 'ASC'; 
        outerOrderBy = `ORDER BY sub.is_sudah_pelatihan ${boolDir}, sub.nama_ptk ASC`;
    }

    // Bangun Query Utama
    const mainQuery = `
      SELECT * FROM (
          SELECT DISTINCT ON (mv.nik)
            mv.nik, mv.nama_ptk, mv.nama_sekolah, mv.bentuk_pendidikan as jenjang,
            mv.kabupaten, mv.kecamatan, mv.status_kepegawaian, mv.pangkat_golongan,
            mv.usia_tahun, mv.is_sudah_pelatihan, mv.judul_diklat, mv.start_date
          FROM mv_dashboard_analitik mv 
          ${whereClause}
          ORDER BY mv.nik, mv.start_date DESC NULLS LAST -- Wajib urut nik dulu untuk DISTINCT ON
      ) as sub
      ${outerOrderBy}
      LIMIT $${counter} OFFSET $${counter + 1}
    `;
    
    const dataValues = [...values, limit, offset];
    const res = await pool.query(mainQuery, dataValues);

    return NextResponse.json({
      meta: { page, limit, totalData, totalPage },
      data: res.rows
    });

  } catch (error) {
    console.error("Error API PTK:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}