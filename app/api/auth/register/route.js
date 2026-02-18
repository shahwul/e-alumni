import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import redis from "@/lib/redis";

export async function POST(req) {
  try {
    const { username, password, email, nama } = await req.json();

    if (!username || !password || !email) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
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