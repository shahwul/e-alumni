import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    return {
      id: decoded.id,
      nama: decoded.nama,
      role: decoded.role,
    };
  } catch (error) {
    console.error("Auth Error:", error.message);
    return null;
  }
}