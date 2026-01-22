import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // ==========================================
    // 1. TANGKAP SEMUA PARAMETER FILTER
    // ==========================================
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    // Filter Basic
    const search = searchParams.get('search') || '';         
    const sekolah = searchParams.get('sekolah') || '';       
    const jenjang = searchParams.get('jenjang') || '';       
    const status = searchParams.get('status') || '';         
    
    // Filter Wilayah
    const kabupaten = searchParams.get('kabupaten') || '';
    const kecamatan = searchParams.get('kecamatan') || '';
    const kabupatenArray = kabupaten ? kabupaten.split(',') : []; 
    const kecamatanArray = kecamatan ? kecamatan.split(',') : []; 
    
    // Filter Spesifik Diklat
    const rumpunId = searchParams.get('rumpun');             
    const subRumpunId = searchParams.get('sub_rumpun');      
    const judulDiklat = searchParams.get('judul_diklat');    
    const startDate = searchParams.get('start_date'); 
    const endDate = searchParams.get('end_date');     

    // ==========================================
    // 2. BANGUN QUERY DINAMIS
    // ==========================================
    // DISTINCT ON (mv.nik) -> Memaksa tampil 1 baris per NIK
    // Kita akan ambil baris dengan tanggal diklat paling baru (via ORDER BY nanti)
    
    let baseQuery = `
      SELECT DISTINCT ON (mv.nik)
        mv.nik, 
        mv.nama_ptk, 
        mv.nama_sekolah, 
        mv.bentuk_pendidikan as jenjang,
        mv.kabupaten,
        mv.kecamatan, 
        mv.status_kepegawaian, 
        mv.pangkat_golongan,       -- Tambahan kolom baru
        mv.usia_tahun,             -- Tambahan kolom baru
        mv.is_sudah_pelatihan, 
        mv.judul_diklat,           -- Ini akan jadi 'Diklat Terakhir' karena sorting
        mv.start_date              -- Tanggal diklat terakhir
      FROM mv_dashboard_analitik mv 
      WHERE 1=1
    `;
    
    // Query khusus buat ngitung total halaman (Count Unik NIK)
    let countQuery = `SELECT COUNT(DISTINCT mv.nik) as total FROM mv_dashboard_analitik mv WHERE 1=1`;

    const values = [];
    let counter = 1;

    // --- LOGIC FILTER (Lebih Simpel & Cepat karena pakai kolom MV langsung) ---

    // 1. Search Nama/NIK
    if (search) {
      const clause = ` AND (mv.nama_ptk ILIKE $${counter} OR mv.nik ILIKE $${counter})`;
      baseQuery += clause; countQuery += clause;
      values.push(`%${search}%`); counter++;
    }

    // 2. Nama Sekolah
    if (sekolah) {
      const clause = ` AND mv.nama_sekolah ILIKE $${counter}`;
      baseQuery += clause; countQuery += clause;
      values.push(`%${sekolah}%`); counter++;
    }

    // 3. Jenjang
    if (jenjang && jenjang !== 'ALL') {
      const clause = ` AND mv.bentuk_pendidikan = $${counter}`;
      baseQuery += clause; countQuery += clause;
      values.push(jenjang); counter++;
    }

    // 4. Wilayah (Kabupaten)
    if (kabupatenArray.length > 0) {
       const placeholders = kabupatenArray.map((_, i) => `$${counter + i}`).join(',');
       const clause = ` AND UPPER(mv.kabupaten) IN (${placeholders})`;
       baseQuery += clause; countQuery += clause;
       kabupatenArray.forEach(k => values.push(k.toUpperCase())); 
       counter += kabupatenArray.length;
    }

    // 5. Wilayah (Kecamatan)
    if (kecamatanArray.length > 0) {
       const placeholders = kecamatanArray.map((_, i) => `$${counter + i}`).join(',');
       const clause = ` AND UPPER(mv.kecamatan) IN (${placeholders})`;
       baseQuery += clause; countQuery += clause;
       kecamatanArray.forEach(k => values.push(k.toUpperCase())); 
       counter += kecamatanArray.length;
    }

    // 6. Filter Tanggal (Langsung tembak kolom MV)
    if (startDate && endDate) {
      const clause = ` AND mv.start_date >= $${counter} AND mv.end_date <= $${counter + 1}`;
      baseQuery += clause; countQuery += clause;
      values.push(startDate); 
      values.push(endDate);   
      counter += 2;
    }

    // 7. Status Pelatihan
    if (status === 'sudah') {
      const clause = ` AND mv.is_sudah_pelatihan = TRUE`;
      baseQuery += clause; countQuery += clause;
    } else if (status === 'belum') {
      const clause = ` AND mv.is_sudah_pelatihan = FALSE`;
      baseQuery += clause; countQuery += clause;
    }

    // 8. Rumpun (Langsung tembak kolom MV)
    if (rumpunId && rumpunId !== 'ALL') {
      const clause = ` AND mv.rumpun_id = $${counter}`;
      baseQuery += clause; countQuery += clause;
      values.push(rumpunId); counter++;
    }

    // 9. Sub Rumpun (Langsung tembak kolom MV)
    if (subRumpunId && subRumpunId !== 'ALL') {
      const clause = ` AND mv.sub_topic_id = $${counter}`;
      baseQuery += clause; countQuery += clause;
      values.push(subRumpunId); counter++;
    }

    // 10. Judul Diklat
    if (judulDiklat) {
      const clause = ` AND mv.judul_diklat ILIKE $${counter}`;
      baseQuery += clause; countQuery += clause;
      values.push(`%${judulDiklat}%`); counter++;
    }

    // ==========================================
    // 3. EKSEKUSI QUERY
    // ==========================================
    
    // A. Hitung Total Data (Unik NIK)
    const countRes = await pool.query(countQuery, values);
    const totalData = parseInt(countRes.rows[0].total);
    const totalPage = Math.ceil(totalData / limit);

    // B. Ambil Data (DISTINCT ON NIK)
    // PENTING: ORDER BY harus dimulai dengan 'mv.nik' karena pakai DISTINCT ON
    // 'mv.start_date DESC' memastikan kita mengambil data diklat TERBARU untuk NIK tersebut.
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