import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // --- 1. TANGKAP SEMUA PARAMETER ---

    // Pagination
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 25; 
    const offset = (page - 1) * limit;

    // Sorting (Prioritas: 'sort' > 'sort_by')
    const sortParam = searchParams.get('sort'); // Format: "nama:asc,usia:desc"
    const sortByLegacy = searchParams.get('sort_by') || 'nama';
    const sortOrderLegacy = searchParams.get('sort_order') || 'asc';

    // Filter Params
    const search = searchParams.get('search') || '';         
    const sekolah = searchParams.get('sekolah') || '';       
    const jenjang = searchParams.get('jenjang') || '';
    const mapel = searchParams.get('mapel') || '';
    const usiaMin = searchParams.get('usia_min');
    const usiaMax = searchParams.get('usia_max');       
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
    const modeFilter = searchParams.get('mode_filter') || 'eligible'; 
    const startDate = searchParams.get('start_date'); 
    const endDate = searchParams.get('end_date');     

    // --- 2. BANGUN WHERE CLAUSE ---
    
    let whereClause = ` WHERE 1=1 `;
    const values = [];
    let counter = 1;

    // ... (Logika Filter Search, Sekolah, Jenjang, dll TETAP SAMA) ...
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
    if (mapel) {
      whereClause += ` AND mv.riwayat_sertifikasi ILIKE $${counter}`;
      values.push(`%${mapel}%`); counter++;
    }
    if (usiaMin && usiaMax) {
      whereClause += ` AND mv.usia_tahun >= $${counter} AND mv.usia_tahun <= $${counter + 1}`;
      values.push(usiaMin); values.push(usiaMax); counter += 2;
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

    // Logic Master Diklat (Tetap sama)
    const hasDiklatFilter = judulDiklatArray.length > 0 || kategoriParam || programParam;
    if (!hasDiklatFilter && modeFilter === 'history') {
        return NextResponse.json({ meta: { page, limit, totalData: 0, totalPage: 0 }, data: [] });
    }

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

    // --- 3. QUERY TOTAL DATA ---
    const countQuery = `SELECT COUNT(DISTINCT mv.nik) as total FROM mv_dashboard_analitik mv ${whereClause}`;
    const countRes = await pool.query(countQuery, values);
    const totalData = parseInt(countRes.rows[0].total);
    const totalPage = Math.ceil(totalData / limit);

    // ==========================================
    // 4. QUERY DATA UTAMA (FIX LOGIC SORTING DI SINI)
    // ==========================================
    
    let outerOrderBy = '';

    if (sortParam) {
        // === LOGIC COMBO SORT (NEW) ===
        // Menerima: "nama:asc,usia:desc"
        const sortParts = sortParam.split(',').map(part => {
            const [field, direction] = part.split(':');
            const dir = direction === 'desc' ? 'DESC' : 'ASC';

            // Mapping dari Frontend Key -> Backend Column
            switch(field) {
                case 'nama': return `sub.nama_ptk ${dir}`;
                case 'nama_ptk': return `sub.nama_ptk ${dir}`; // Handle legacy
                case 'sekolah': return `sub.nama_sekolah ${dir}`;
                case 'nama_sekolah': return `sub.nama_sekolah ${dir}`;
                case 'usia': return `sub.usia_tahun ${dir}`;
                case 'usia_tahun': return `sub.usia_tahun ${dir}`;
                case 'status': return `sub.status_kepegawaian ${dir}`;
                case 'mapel': return `sub.mapel ${dir}`; 
                case 'is_sudah_pelatihan': return `sub.is_sudah_pelatihan ${dir}`;
                default: return null; 
            }
        }).filter(Boolean);

        if (sortParts.length > 0) {
            outerOrderBy = `ORDER BY ${sortParts.join(', ')}`;
        } else {
            outerOrderBy = `ORDER BY sub.nama_ptk ASC`;
        }

    } else {
        // === LOGIC SINGLE SORT (LEGACY FALLBACK) ===
        // Dipakai jika frontend belum kirim param 'sort'
        const dir = sortOrderLegacy === 'desc' ? 'DESC' : 'ASC';
        switch (sortByLegacy) {
            case 'nama': outerOrderBy = `ORDER BY sub.nama_ptk ${dir}`; break;
            case 'sekolah': outerOrderBy = `ORDER BY sub.nama_sekolah ${dir}`; break;
            case 'status': outerOrderBy = `ORDER BY sub.status_kepegawaian ${dir}`; break;
            case 'usia': outerOrderBy = `ORDER BY sub.usia_tahun ${dir}`; break;
            default: outerOrderBy = `ORDER BY sub.nama_ptk ASC`;
        }
    }

    // Bangun Query Utama
    const mainQuery = `
      SELECT * FROM (
          SELECT DISTINCT ON (mv.nik)
            mv.nik, mv.nama_ptk, mv.nama_sekolah, mv.bentuk_pendidikan as jenjang,
            mv.kabupaten, mv.kecamatan, mv.status_kepegawaian, mv.riwayat_sertifikasi as mapel, mv.pangkat_golongan,
            mv.usia_tahun, mv.is_sudah_pelatihan, mv.judul_diklat, mv.start_date
          FROM mv_dashboard_analitik mv 
          ${whereClause}
          ORDER BY mv.nik, mv.start_date DESC NULLS LAST -- Sorting Wajib untuk DISTINCT
      ) as sub
      ${outerOrderBy} -- Sorting Dinamis dari User
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