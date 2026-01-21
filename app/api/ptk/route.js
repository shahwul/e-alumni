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

    const search = searchParams.get('search') || '';         // Nama Guru / NIK
    const sekolah = searchParams.get('sekolah') || '';       // Nama Sekolah
    const jenjang = searchParams.get('jenjang') || '';       // SD, SMP, SMA
    const status = searchParams.get('status') || '';         // 'sudah' atau 'belum'
    
    // Filter Khusus (Hanya diproses jika status = 'sudah')
    const rumpunId = searchParams.get('rumpun');             // ID Topik (Ref_Topik)
    const subRumpunId = searchParams.get('sub_rumpun');      // ID Sub-Topik (Ref_SubTopik)

    // ==========================================
    // 2. BANGUN QUERY DINAMIS
    // ==========================================
    // Kita mulai dari Materialized View (Data Utama)
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

    // --- Filter 3: Jenjang (Bentuk Pendidikan) ---
    if (jenjang) {
      baseQuery += ` AND mv.bentuk_pendidikan = $${counter}`;
      values.push(jenjang);
      counter++;
    }

    // --- Filter 4: Status Pelatihan (Sudah/Belum) ---
    if (status === 'sudah') {
      baseQuery += ` AND mv.is_sudah_pelatihan = TRUE`;
      
      // === LOGIC FILTER RUMPUN (Advanced) ===
      // Filter ini hanya jalan kalau user sudah pernah pelatihan.
      // Kita harus "mengintip" ke tabel history (data_alumni & master_diklat)
      // menggunakan teknik EXISTS (Subquery) agar performa tetap cepat.
      
      if (rumpunId) {
        // Cari guru yang PERNAH ikut diklat dengan topik ID sekian
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
        // Cari guru yang PERNAH ikut diklat dengan sub-topik ID sekian
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

    } else if (status === 'belum') {
      baseQuery += ` AND mv.is_sudah_pelatihan = FALSE`;
    }

    // ==========================================
    // 3. EKSEKUSI QUERY (Count & Data)
    // ==========================================
    
    // A. Hitung Total Data (Untuk Pagination)
    const countSql = `SELECT COUNT(*) as total ${baseQuery}`;
    const countRes = await pool.query(countSql, values);
    const totalData = parseInt(countRes.rows[0].total);
    const totalPage = Math.ceil(totalData / limit);

    // B. Ambil Data Sebenarnya
    // Kita tambahkan kolom detail
    const dataSql = `
      SELECT 
        mv.nik, 
        mv.nama_ptk, 
        mv.nama_sekolah, 
        mv.bentuk_pendidikan as jenjang,
        mv.kecamatan, 
        mv.status_kepegawaian, 
        mv.is_sudah_pelatihan, 
        mv.judul_diklat_terakhir
      ${baseQuery}
      ORDER BY mv.nama_ptk ASC 
      LIMIT $${counter} OFFSET $${counter + 1}
    `;
    
    // Tambahkan parameter limit & offset
    const dataValues = [...values, limit, offset];
    
    const res = await pool.query(dataSql, dataValues);

    return NextResponse.json({
      meta: {
        page,
        limit,
        totalData,
        totalPage
      },
      data: res.rows
    });

  } catch (error) {
    console.error("Error API PTK:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}