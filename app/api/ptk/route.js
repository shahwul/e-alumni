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
    const search = searchParams.get('search') || '';         // Nama Guru / NIK
    const sekolah = searchParams.get('sekolah') || '';       // Nama Sekolah
    const jenjang = searchParams.get('jenjang') || '';       // SD, SMP, SMA
    const status = searchParams.get('status') || '';         // 'sudah' atau 'belum'
    
    // Filter Wilayah
    const kabupaten = searchParams.get('kabupaten') || '';
    const kecamatan = searchParams.get('kecamatan') || '';
    const kabupatenArray = kabupaten ? kabupaten.split(',') : []; // Split jadi array
    const kecamatanArray = kecamatan ? kecamatan.split(',') : []; // Split jadi array
    
    // Filter Spesifik Diklat (BARU) 
    const rumpunId = searchParams.get('rumpun');             // ID Topik
    const subRumpunId = searchParams.get('sub_rumpun');      // ID Sub-Topik
    const diklatId = searchParams.get('diklat_id');          // ID Diklat Spesifik
    const judulDiklat = searchParams.get('judul_diklat');    // Search Nama Diklat

    const startDate = searchParams.get('start_date'); // Format: YYYY-MM-DD
    const endDate = searchParams.get('end_date');     // Format: YYYY-MM-DD

    // ==========================================
    // 2. BANGUN QUERY DINAMIS
    // ==========================================
    let baseQuery = `FROM mv_dashboard_analitik mv WHERE 1=1`;
    const values = [];
    let counter = 1;

    // --- Filter 1: Search Nama/NIK ---
    if (search) {
      baseQuery += ` AND (mv.nama_ptk ILIKE $${counter} OR mv.nik ILIKE $${counter})`;
      values.push(`%${search}%`);
      counter++;
    }

    // --- Filter 2: Nama Sekolah ---
    if (sekolah) {
      baseQuery += ` AND mv.nama_sekolah ILIKE $${counter}`;
      values.push(`%${sekolah}%`);
      counter++;
    }

    // --- Filter 3: Jenjang ---
    if (jenjang) {
      baseQuery += ` AND mv.bentuk_pendidikan ILIKE $${counter}`;
      values.push(jenjang);
      counter++;
    }

    // --- Filter 4: Wilayah ---
    if (kabupatenArray.length > 0) {
       // Logic IN clause ($1, $2, $3)
       const placeholders = kabupatenArray.map((_, i) => `$${counter + i}`).join(',');
        baseQuery += ` AND UPPER(mv.kabupaten) IN (${placeholders})`;
        kabupatenArray.forEach(k => values.push(k.toUpperCase()));
        counter += kabupatenArray.length;
    }

    // --- Filter Kecamatan (Multi) ---
    if (kecamatanArray.length > 0) {
       // Logic IN clause ($1, $2, $3)
       const placeholders = kecamatanArray.map((_, i) => `$${counter + i}`).join(',');
       baseQuery += ` AND UPPER(mv.kecamatan) IN (${placeholders})`;
       kecamatanArray.forEach(k => values.push(k.toUpperCase()));
       counter += kecamatanArray.length;
    }

    if (startDate && endDate) {
      baseQuery += ` 
        AND EXISTS (
          SELECT 1 FROM data_alumni da
          JOIN master_diklat md ON da.id_diklat = md.id
          WHERE da.nik = mv.nik 
          AND da.status_kelulusan = 'Lulus'
          AND md.start_date >= $${counter} 
          AND md.end_date <= $${counter + 1}
        )
      `;
      values.push(startDate); // counter
      values.push(endDate);   // counter + 1
      counter += 2;
    }

    // --- Filter 5: Status Pelatihan ---
    if (status === 'sudah') {
      baseQuery += ` AND mv.is_sudah_pelatihan = TRUE`;
    } else if (status === 'belum') {
      baseQuery += ` AND mv.is_sudah_pelatihan = FALSE`;
    }

    // --- Filter 6: Rumpun / Topik ---
    if (rumpunId) {
      baseQuery += ` 
        AND EXISTS (
          SELECT 1 FROM data_alumni da
          JOIN master_diklat md ON da.id_diklat = md.id
          JOIN ref_sub_topik rst ON md.sub_topic_id = rst.id
          WHERE da.nik = mv.nik 
          AND da.status_kelulusan = 'Lulus'
          AND rst.topic_id = $${counter}
        )
      `;
      values.push(rumpunId);
      counter++;
    }

    if (subRumpunId) {
      baseQuery += ` 
        AND EXISTS (
          SELECT 1 FROM data_alumni da
          JOIN master_diklat md ON da.id_diklat = md.id
          WHERE da.nik = mv.nik 
          AND da.status_kelulusan = 'Lulus'
          AND md.sub_topic_id = $${counter}
        )
      `;
      values.push(subRumpunId);
      counter++;
    }

    // --- Filter 7: Spesifik Diklat (BARU) ---
    // Cari guru yang pernah ikut diklat dengan ID tertentu
    if (diklatId) {
      baseQuery += ` 
        AND EXISTS (
          SELECT 1 FROM data_alumni da
          WHERE da.nik = mv.nik 
          AND da.status_kelulusan = 'Lulus'
          AND da.id_diklat = $${counter}
        )
      `;
      values.push(diklatId);
      counter++;
    }

    // Cari guru yang pernah ikut diklat dengan JUDUL mengandung kata tertentu
    if (judulDiklat) {
      baseQuery += ` 
        AND EXISTS (
          SELECT 1 FROM data_alumni da
          JOIN master_diklat md ON da.id_diklat = md.id
          WHERE da.nik = mv.nik 
          AND da.status_kelulusan = 'Lulus'
          AND md.title ILIKE $${counter}
        )
      `;
      values.push(`%${judulDiklat}%`);
      counter++;
    }

    // ==========================================
    // 3. EKSEKUSI QUERY
    // ==========================================
    
    // Hitung Total (Pagination)
    const countSql = `SELECT COUNT(*) as total ${baseQuery}`;
    const countRes = await pool.query(countSql, values);
    const totalData = parseInt(countRes.rows[0].total);
    const totalPage = Math.ceil(totalData / limit);

    // Ambil Data
    const dataSql = `
      SELECT 
        mv.nik, 
        mv.nama_ptk, 
        mv.nama_sekolah, 
        mv.bentuk_pendidikan as jenjang,
        mv.kabupaten,
        mv.kecamatan, 
        mv.status_kepegawaian, 
        mv.is_sudah_pelatihan, 
        mv.judul_diklat_terakhir
      ${baseQuery}
      ORDER BY mv.nama_ptk ASC 
      LIMIT $${counter} OFFSET $${counter + 1}
    `;
    
    const dataValues = [...values, limit, offset];
    const res = await pool.query(dataSql, dataValues);

    return NextResponse.json({
      meta: { page, limit, totalData, totalPage },
      data: res.rows
    });

  } catch (error) {
    console.error("Error API PTK:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}