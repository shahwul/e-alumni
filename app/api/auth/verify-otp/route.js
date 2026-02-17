import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    const cachedData = await redis.get(`reg:${email}`);
    console.log("Cached Data:", cachedData); 
    if (!cachedData) {
      return NextResponse.json({ message: "OTP Kedaluwarsa" }, { status: 400 });
    }

    const userData = JSON.parse(cachedData);

    if (userData.otp.toString().trim() !== otp.toString().trim()) {
      return NextResponse.json({ 
        message: "OTP tidak sesuai",
      }, { status: 400 });
    }

    await prisma.users.create({
      data: {
        username: userData.username,
        password: userData.password,
        nama: userData.nama,
        email: email,
        role: "SUPERADMIN"
      }
    });

    await redis.del(`reg:${email}`);

    return NextResponse.json({ message: "Akun berhasil dibuat" });
  } catch (error) {
    return NextResponse.json({ message: "Gagal verifikasi" }, { status: 500 });
  }
}