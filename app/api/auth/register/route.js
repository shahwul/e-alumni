import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import redis from "@/lib/redis";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { username, password, email, nama } = body;

    // --- CEK DATABASE DULU (Bahkan sebelum validasi data lengkap) ---
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          username ? { username } : null,
          email ? { email } : null
        ].filter(Boolean)
      }
    });

    if (existingUser) {
      const isUsernameMatch = username && existingUser.username === username;
      return NextResponse.json(
        { message: `${isUsernameMatch ? "Username" : "Email"} sudah digunakan` }, 
        { status: 400 }
      );
    }

    // Baru di sini cek data lengkap untuk kirim OTP
    if (!username || !password || !email) {
       // Jika cuma kirim salah satu (buat check), jangan error 400 dulu, kasih info "Aman"
       return NextResponse.json({ message: "Data belum lengkap tapi tersedia" }, { status: 200 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 12);

    const userData = JSON.stringify({ username, password: hashedPassword, nama, otp });
    await redis.setex(`reg:${email}`, 300, userData);

    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: '"E-Alumni Admin" <no-reply@bbgtk.com>',
      to: email,
      subject: "Verifikasi OTP Registrasi",
      html: `<h3>Kode OTP: ${otp}</h3><p>Berlaku selama 5 menit.</p>`,
    });

    return NextResponse.json({ message: "OTP berhasil dikirim" });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    const email = searchParams.get("email");

    if (!username && !email) {
      return NextResponse.json({ message: "Parameter kurang" }, { status: 400 });
    }

    const where = {};
    if (username) where.username = username;
    if (email) where.email = email;

    const existingUser = await prisma.users.findFirst({
      where: where,
    });

    if (existingUser) {
      return NextResponse.json({ 
        available: false, 
        message: username ? "Username sudah digunakan" : "Email sudah terdaftar" 
      }, { status: 200 });
    }

    return NextResponse.json({ 
      available: true, 
      message: "Tersedia" 
    });

  } catch (error) {
    console.error("Check User Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}