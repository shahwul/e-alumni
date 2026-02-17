import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    const user = await prisma.users.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ message: "Kredensial tidak valid" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Kredensial tidak valid" }, { status: 401 });
    }

    await prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() }
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const response = NextResponse.json({ message: "Login sukses" });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}