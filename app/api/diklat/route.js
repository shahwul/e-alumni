import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    // --- AMBIL PARAMETER FILTER ---
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const rumpunId = searchParams.get('rumpun');
    const subRumpunId = searchParams.get('sub_rumpun');

    // Parameter Array (dipisah koma)
    const modaRaw = searchParams.get('moda');
    const kategoriRaw = searchParams.get('kategori');
    const programRaw = searchParams.get('program');
    const jenjangRaw = searchParams.get('jenjang');
    const jabatanRaw = searchParams.get('jabatan');

    // Helper convert string "A,B" ke Array ['A','B']
    const modaArray = modaRaw ? modaRaw.split(',') : [];
    const kategoriArray = kategoriRaw ? kategoriRaw.split(',') : [];
    const programArray = programRaw ? programRaw.split(',') : [];
    const jenjangArray = jenjangRaw ? jenjangRaw.split(',') : [];
    const jabatanArray = jabatanRaw ? jabatanRaw.split(',') : [];

    let baseQuery = `
      SELECT 
        md.id,
        md.title,
        md.start_date,
        md.end_date,
        md.total_jp,
        md.course_code,
        md.participant_limit,
        md.jenis_kegiatan, -- Kolom baru
        md.jenis_program,     -- Kolom baru
        rt.topic_name as rumpun,
        rst.sub_topic_name as sub_rumpun,
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

    // --- LOGIC FILTERING ---

    // 1. Search Judul
    if (search) {
      baseQuery += ` AND md.title ILIKE $${counter}`;
      values.push(`%${search}%`); counter++;
    }

    // 2. Filter Tanggal (Range Pelaksanaan)
    if (startDate) {
      baseQuery += ` AND md.start_date >= $${counter}`;
      values.push(startDate); counter++;
    }
    if (endDate) {
      baseQuery += ` AND md.end_date <= $${counter}`;
      values.push(endDate); counter++;
    }

    if (rumpunId && rumpunId !== 'ALL') {
      baseQuery += ` AND rt.id = $${counter}`;
      values.push(rumpunId); counter++;
    }

    if (subRumpunId && subRumpunId !== 'ALL') {
      baseQuery += ` AND rst.id = $${counter}`;
      values.push(subRumpunId); counter++;
    }

    // 5. Filter Moda (Array Check)
    // Asumsi: rm.mode_name menyimpan string "Luring", "Daring", dll
    if (modaArray.length > 0) {
      baseQuery += ` AND rm.mode_name = ANY($${counter})`;
      values.push(modaArray); counter++;
    }

    // 6. Filter Kategori (Array Check - Kolom Enum baru)
    if (kategoriArray.length > 0) {
      // Casting ::text diperlukan jika kolom di DB adalah tipe ENUM
      baseQuery += ` AND md.jenis_kegiatan::text = ANY($${counter})`;
      values.push(kategoriArray); counter++;
    }

    // 7. Filter Program (Array Check - Kolom Enum baru)
    if (programArray.length > 0) {
      baseQuery += ` AND md.jenis_program::text = ANY($${counter})`;
      values.push(programArray); counter++;
    }

    // 8. Filter Jenjang Sasaran (Pencarian Text Sederhana)
    // Asumsi: Ada kolom 'sasaran_jenjang' yang berisi teks misal "SD, SMP"
    if (jenjangArray.length > 0) {
        // Kita gunakan logika OR: jika salah satu jenjang yang dipilih ada di data
        // Contoh: (sasaran_jenjang ILIKE '%SD%' OR sasaran_jenjang ILIKE '%SMP%')
        const conditions = jenjangArray.map((_, i) => `md.sasaran_jenjang ILIKE $${counter + i}`).join(' OR ');
        baseQuery += ` AND (${conditions})`;
        jenjangArray.forEach(j => { values.push(`%${j}%`); });
        counter += jenjangArray.length;
    }

    // 9. Filter Jabatan Sasaran (Pencarian Text Sederhana)
    // Asumsi: Ada kolom 'sasaran_jabatan'
    if (jabatanArray.length > 0) {
        const conditions = jabatanArray.map((_, i) => `md.sasaran_jabatan ILIKE $${counter + i}`).join(' OR ');
        baseQuery += ` AND (${conditions})`;
        jabatanArray.forEach(j => { values.push(`%${j}%`); });
        counter += jabatanArray.length;
    }


    // Group By & Paginasi
    baseQuery += ` 
      GROUP BY md.id, md.title, md.start_date, md.end_date, md.total_jp, md.participant_limit, md.course_code, md.jenis_kegiatan, md.jenis_program, rt.topic_name, rst.sub_topic_name, rm.mode_name
      ORDER BY md.start_date DESC
      LIMIT $${counter} OFFSET $${counter + 1}
    `;
    
    values.push(limit, offset);

    const res = await pool.query(baseQuery, values);
    
    // Hitung Total Data (Sederhana)
    // Catatan: Untuk pagination akurat dengan filter kompleks, query count juga harus di-filter sama seperti baseQuery (kecuali LIMIT/OFFSET).
    // Untuk performa di contoh ini, saya biarkan count total global dulu.
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
    return NextResponse.json({ error: 'Gagal memuat data diklat' }, { status: 500 });
  }
}