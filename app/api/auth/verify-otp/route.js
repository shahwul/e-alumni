import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    const cachedData = await redis.get(`reg:${email}`);
    if (!cachedData) {
      return NextResponse.json({ message: "OTP Kedaluwarsa" }, { status: 400 });
    }

    const attemptsKey = `reg_attempts:${email}`;
    const attempts = await redis.incr(attemptsKey);
    if (attempts === 1) {
      await redis.expire(attemptsKey, 300);
    }

    if (attempts > 5) {
      await redis.del(`reg:${email}`);
      await redis.del(attemptsKey);
      return NextResponse.json({ message: "Terlalu banyak percobaan OTP gagal. Silakan request OTP baru." }, { status: 429 });
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
        role: "USER"
      }
    });

    await redis.del(`reg:${email}`);

    return NextResponse.json({ message: "Akun berhasil dibuat" });
  } catch (error) {
    return NextResponse.json({ message: "Gagal verifikasi" }, { status: 500 });
  }
}