import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import redis from "@/lib/redis";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    const email = searchParams.get("email");

    if (!username && !email) return NextResponse.json({ message: "Parameter kurang" }, { status: 400 });

    const existingUser = await prisma.users.findFirst({
      where: { OR: [username ? { username } : null, email ? { email } : null].filter(Boolean) }
    });

    return NextResponse.json({ 
      available: !existingUser, 
      message: existingUser ? (existingUser.username === username ? "Username sudah ada" : "Email sudah ada") : "Tersedia" 
    });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { username, password, email, nama } = await req.json();

    if (!username || !password || !email) {
      return NextResponse.json({ message: "Data harus lengkap" }, { status: 400 });
    }

    const existingUser = await prisma.users.findFirst({
      where: { OR: [{ username }, { email }] }
    });
    if (existingUser) return NextResponse.json({ message: "User sudah terdaftar" }, { status: 400 });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 12);

    const userData = JSON.stringify({ username, password: hashedPassword, nama, otp });
    await redis.setex(`reg:${email}`, 300, userData);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: '"E-Alumni Admin" <no-reply@bbgtk.com>',
      to: email,
      subject: "Kode Verifikasi E-Alumni",
      html: `<div style="font-family: sans-serif;">
              <h2>Halo ${nama || username},</h2>
              <p>Kode verifikasi kamu adalah:</p>
              <h1 style="color: #4f46e5;">${otp}</h1>
              <p>Berlaku selama 5 menit. Jangan bagikan kode ini kepada siapapun.</p>
            </div>`,
    });

    return NextResponse.json({ message: "OTP berhasil dikirim" });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: "Gagal mengirim OTP" }, { status: 500 });
  }
}