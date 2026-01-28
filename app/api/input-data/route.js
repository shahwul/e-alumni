import { NextResponse } from "next/server";
import pool from '@/lib/db'; 
import { ja } from "date-fns/locale";
import { sub } from "date-fns";

// Save referensi dropdown diklat

export async function GET() {
  try {
    const [resTopik, resSubTopik, resJenjang, resModa, resJabatan, resKategori] = await Promise.all([
      pool.query("SELECT * FROM ref_topik"),
      pool.query("SELECT * FROM ref_sub_topik"),
      pool.query("SELECT * FROM ref_jenjang_sasaran"),
      pool.query("SELECT * FROM ref_mode"),
      pool.query("SELECT * FROM ref_jabatan_sasaran"),
      pool.query("SELECT * FROM ref_kategori")
    ]);

    return NextResponse.json({
      topik: resTopik.rows,
      subTopik: resSubTopik.rows,
      jenjang: resJenjang.rows,
      moda: resModa.rows,
      jabatan: resJabatan.rows,
      kategori: resKategori.rows,
    });
    
  } catch (error) {
    console.error("Database Error:", error.message);
    return NextResponse.json(
      { error: "Gagal mengambil referensi" }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    const [resTopik, resSubTopik] = await Promise.all([
      pool.query("SELECT topic_name FROM ref_topik WHERE id = $1", [data.rumpun]),
      pool.query("SELECT sub_topic_name FROM ref_sub_topik WHERE id = $1", [data.sub_rumpun])
    ]);

    const rumpunName = resTopik.rows[0]?.topic_name || "XX";
    const subRumpunName = resSubTopik.rows[0]?.sub_topic_name || "XX";

    // 1. Logic Generate Short Title
    const course_code = "ID" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const year = new Date().getFullYear();
    const semester = (new Date(data.start_date).getMonth() < 6) ? "2" : "1";
    const generatedShortTitle = `${course_code}-${rumpunName.substring(0, 3).toUpperCase()}-${subRumpunName.substring(0, 3).toUpperCase()}-${year}-${semester}`;
    const generatedChainCode = `0${data.jenjang}0${data.rumpun}${data.sub_rumpun}`;
    // 2. Insert into Database
    // Note: Mapping frontend names (e.g., 'lokasi') to DB columns (e.g., 'location')
    const query = `
      INSERT INTO master_diklat (
        title, short_title, start_date, end_date, 
        location, category_id, mode_id, education_level_id, 
        occupation_id, course_code, description, participant_limit, 
        jenis_diklat, jenis_program, topic_id, sub_topic_id,
        chain_code, total_jp

      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *;
    `;

    const values = [
      data.title,
      generatedShortTitle,                    // $2
      new Date(data.start_date),              // $3
      new Date(data.end_date),                // $4
      data.lokasi,                            // $5 (mapped from lokasi)                   // $8 (mode_id                 // $10 (occupation_id)
      data.kategori || null,
      data.moda || null,
      data.jenjang || null,                   // $9 (education_level_id)
      data.jabatan || null,            
      course_code,                             // $12
      data.description,
      parseInt(data.total_peserta) || 0,      // $5
      data.jenis_kegiatan,                  
      data.jenis_program,
      data.rumpun,
      data.sub_rumpun,
      generatedChainCode,
      parseInt(data.total_jp) || 0,
    ];

    const result = await pool.query(query, values);
    
    return NextResponse.json(
      { message: "Data diklat berhasil disimpan!", data: result.rows[0] }, 
      { status: 201 }
    );
  } catch (error) {
    console.error("Error di API POST:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan ke database: " + error.message }, 
      { status: 500 }
    );
  }
}