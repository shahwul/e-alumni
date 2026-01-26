import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // ... (Bagian ambil parameter page, limit, dll SAMA SEPERTI SEBELUMNYA) ...
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

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
    
    const judulDiklatRaw = searchParams.get('judul_diklat'); 
    let judulDiklatArray = [];
    if (judulDiklatRaw) {
        if (judulDiklatRaw.includes('||')) {
            judulDiklatArray = judulDiklatRaw.split('||');
        } else {
            // Fallback kalau frontend kirim pake koma (seperti di log kamu)
            judulDiklatArray = judulDiklatRaw.split(','); 
        }
    } 
    const modeFilter = searchParams.get('mode_filter') || 'history'; 
    
    const startDate = searchParams.get('start_date'); 
    const endDate = searchParams.get('end_date');     

    // ==========================================
    // 2. BANGUN QUERY DINAMIS
    // ==========================================
    
    let baseQuery = `
      SELECT DISTINCT ON (mv.nik)
        mv.nik, mv.nama_ptk, mv.nama_sekolah, mv.bentuk_pendidikan as jenjang,
        mv.kabupaten, mv.kecamatan, mv.status_kepegawaian, mv.pangkat_golongan,
        mv.usia_tahun, mv.is_sudah_pelatihan, mv.judul_diklat, mv.start_date
      FROM mv_dashboard_analitik mv 
      WHERE 1=1
    `;
    
    let countQuery = `SELECT COUNT(DISTINCT mv.nik) as total FROM mv_dashboard_analitik mv WHERE 1=1`;

    const values = [];
    let counter = 1;

    // ... (Filter Basic: Search, Sekolah, Jenjang, Wilayah SAMA) ...
    if (search) {
      const clause = ` AND (mv.nama_ptk ILIKE $${counter} OR mv.nik ILIKE $${counter})`;
      baseQuery += clause; countQuery += clause;
      values.push(`%${search}%`); counter++;
    }
    if (sekolah) {
      const clause = ` AND mv.nama_sekolah ILIKE $${counter}`;
      baseQuery += clause; countQuery += clause;
      values.push(`%${sekolah}%`); counter++;
    }
    if (jenjang && jenjang !== 'ALL') {
      const clause = ` AND mv.bentuk_pendidikan = $${counter}`;
      baseQuery += clause; countQuery += clause;
      values.push(jenjang); counter++;
    }
    if (kabupatenArray.length > 0) {
       const placeholders = kabupatenArray.map((_, i) => `$${counter + i}`).join(',');
       const clause = ` AND UPPER(mv.kabupaten) IN (${placeholders})`;
       baseQuery += clause; countQuery += clause;
       kabupatenArray.forEach(k => values.push(k.toUpperCase())); counter += kabupatenArray.length;
    }
    if (kecamatanArray.length > 0) {
       const placeholders = kecamatanArray.map((_, i) => `$${counter + i}`).join(',');
       const clause = ` AND UPPER(mv.kecamatan) IN (${placeholders})`;
       baseQuery += clause; countQuery += clause;
       kecamatanArray.forEach(k => values.push(k.toUpperCase())); counter += kecamatanArray.length;
    }

    // --- FILTER TANGGAL (GLOBAL) ---
    // Hanya aktif jika TIDAK dalam mode eligible dengan judul (untuk mencegah konflik logika)
    if (startDate && endDate) {
       const isEligibleWithJudul = modeFilter === 'eligible' && judulDiklatArray.length > 0;
       if (!isEligibleWithJudul) {
          const clause = ` AND mv.start_date >= $${counter} AND mv.end_date <= $${counter + 1}`;
          baseQuery += clause; countQuery += clause;
          values.push(startDate); values.push(endDate); counter += 2;
       }
    }

    // Status Pelatihan
    if (status === 'sudah') {
      const clause = ` AND mv.is_sudah_pelatihan = TRUE`;
      baseQuery += clause; countQuery += clause;
    } else if (status === 'belum') {
      const clause = ` AND mv.is_sudah_pelatihan = FALSE`;
      baseQuery += clause; countQuery += clause;
    }

    // Rumpun (Perbaikan nama kolom mv.rumpun_id)
    if (rumpunId && rumpunId !== 'ALL') {
      const clause = ` AND mv.rumpun_id = $${counter}`; // Pastikan di MV namanya rumpun_id
      baseQuery += clause; countQuery += clause;
      values.push(rumpunId); counter++;
    }
    if (subRumpunId && subRumpunId !== 'ALL') {
      const clause = ` AND mv.sub_topic_id = $${counter}`;
      baseQuery += clause; countQuery += clause;
      values.push(subRumpunId); counter++;
    }

    // ============================================================
    // UPDATE LOGIC FILTER DIKLAT (FIX MATCHING ISSUE)
    // ============================================================
    if (judulDiklatArray.length > 0) {
        const placeholders = judulDiklatArray.map((_, i) => `$${counter + i}`).join(',');
        let clause = '';

        if (modeFilter === 'eligible') {
            // [MODE KANDIDAT]
            // Cari yang TIDAK ADA di history.
            
            // Cek apakah ada filter tanggal?
            // Jika ada, berarti kita cari yang belum lulus PADA TANGGAL ITU.
            // (Hati-hati: X yg lulus tahun lalu akan MUNCUL jika filter tanggal tahun ini aktif)
            let dateSubQuery = '';
            if (startDate && endDate) {
                // Kita inject string tanggal langsung karena keterbatasan counter parameter di nested block
                // Asumsi startDate valid YYYY-MM-DD dari frontend
                dateSubQuery = ` AND md.start_date >= '${startDate}' AND md.end_date <= '${endDate}' `;
            }

              clause = ` 
                AND mv.nik NOT IN (
                    SELECT da.nik 
                    FROM data_alumni da
                    JOIN master_diklat md ON da.id_diklat = md.id
                    WHERE da.status_kelulusan ILIKE 'Lulus'
                    AND md.title = ANY(ARRAY[${placeholders}])
                    ${dateSubQuery}
                )
            `;
        } else {
            // [MODE RIWAYAT]
            clause = ` 
                AND EXISTS (
                    SELECT 1 FROM data_alumni da
                    JOIN master_diklat md ON da.id_diklat = md.id
                    WHERE da.nik::text = mv.nik::text 
                    AND da.status_kelulusan ILIKE 'Lulus'     -- FIX 2
                    AND md.title = ANY(ARRAY[${placeholders}])
                )
            `;
        }
        
        baseQuery += clause; countQuery += clause;
        judulDiklatArray.forEach(t => values.push(t.trim()));
        counter += judulDiklatArray.length;
    }

    // ==========================================
    // 3. EKSEKUSI QUERY
    // ==========================================
    const countRes = await pool.query(countQuery, values);
    const totalData = parseInt(countRes.rows[0].total);
    const totalPage = Math.ceil(totalData / limit);

    baseQuery += ` ORDER BY mv.nik ASC, mv.start_date DESC NULLS LAST LIMIT $${counter} OFFSET $${counter + 1}`;
    
    const dataValues = [...values, limit, offset];
    const res = await pool.query(baseQuery, dataValues);

    return NextResponse.json({
      meta: { page, limit, totalData, totalPage },
      data: res.rows
    });

  } catch (error) {
    console.error("Error API PTK:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}