import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request) {
  try {
    // 1. Ambil data yang dikirim dari form
    const data = await request.json();

    const shortTitle = data.title.split(" ").slice(0, 3).join(" ");

    const newDiklat = await db.diklat.create({
      data: {
        title: data.title,
        // short title 
        start_date: new Date(data.start_date), // Konversi string tanggal ke Date object
        end_date: new Date(data.end_date),
        total_peserta: parseInt(data.total_peserta), // Pastikan angka
        location: data.location,
        category_id: parseInt(data.category_id),
        mode_id: parseInt(data.mode_id),
        education_level_id: parseInt(data.education_level_id),
        occupation_id: parseInt(data.occupation_id),
        course_code: data.course_code,
        description: data.description,
        participant_limit : parseInt(data.participant_limit),
      }
    });
    
    console.log("Data diterima untuk diproses:", data);

    // 3. Beri respon balik ke form (frontend)
    return NextResponse.json(
      { message: "Data diklat berhasil disimpan!" }, 
      { status: 201 }
    );
  } catch (error) {
    console.error("Error di API:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data ke database" }, 
      { status: 500 }
    );
  }
}