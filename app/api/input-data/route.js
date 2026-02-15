import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 

export async function GET() {
  try {
    const [
      resTopik, 
      resSubTopik, 
      resJenjang, 
      resModa, 
      resJabatan, 
      resKategori
    ] = await Promise.all([
      prisma.ref_topik.findMany(),
      prisma.ref_sub_topik.findMany(),
      prisma.ref_jenjang_sasaran.findMany(),
      prisma.ref_mode.findMany(),
      prisma.ref_jabatan_sasaran.findMany(),
      prisma.ref_kategori.findMany()
    ]);

    return NextResponse.json({
      topik: resTopik,
      subTopik: resSubTopik,
      jenjang: resJenjang,
      moda: resModa,
      jabatan: resJabatan,
      kategori: resKategori,
    });
    
  } catch (error) {
    console.error("Prisma Error (GET Referensi):", error);
    return NextResponse.json(
      { error: "Gagal mengambil referensi" }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const topicId = parseInt(data.topic_id);
    const subTopicId = parseInt(data.sub_topic_id);

    const [topik, subTopik] = await Promise.all([
      prisma.ref_topik.findUnique({ where: { id: topicId } }),
      prisma.ref_sub_topik.findUnique({ where: { id: subTopicId } })
    ]);

    const rumpunName = topik?.topic_name || "XX";
    const subRumpunName = subTopik?.sub_topic_name || "XX";

    const course_code = "ID" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const year = new Date().getFullYear();
    const semester = (new Date(data.start_date).getMonth() < 6) ? "2" : "1";
    
    const generatedShortTitle = `${course_code}-${rumpunName.substring(0, 3).toUpperCase()}-${subRumpunName.substring(0, 3).toUpperCase()}-${year}-${semester}`;
    const generatedChainCode = `0${data.education_level_id}0${data.topic_id}${data.sub_topic_id}`;

    const newDiklat = await prisma.master_diklat.create({
      data: {
        title: data.title,
        short_title: generatedShortTitle,
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date),
        location: data.location,
        description: data.description,
        course_code: course_code,
        chain_code: generatedChainCode,
        participant_limit: parseInt(data.participant_limit) || 0,
        total_jp: parseInt(data.total_jp) || 0,
        category_id: data.category_id ? parseInt(data.category_id) : null,
        mode_id: data.mode_id ? parseInt(data.mode_id) : null,
        education_level_id: data.education_level_id ? parseInt(data.education_level_id) : null,
        occupation_id: data.occupation_id ? parseInt(data.occupation_id) : null,
        topic_id: topicId,
        sub_topic_id: subTopicId,
        jenis_kegiatan: data.jenis_kegiatan, // Pastikan value sesuai Enum di schema ('Pelatihan' / 'Non_Pelatihan')
        jenis_program: data.jenis_program,   // Pastikan value sesuai Enum ('Nasional' / 'BBGTK_DIY')
        jenis_perekrutan: data.jenis_perekrutan
      }
    });

    return NextResponse.json(
      { message: "Data diklat berhasil disimpan!", data: newDiklat }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("Prisma Error (POST Diklat):", error);
    return NextResponse.json(
      { error: "Gagal menyimpan ke database: " + error.message }, 
      { status: 500 }
    );
  }
}