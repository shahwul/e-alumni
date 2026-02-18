import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fetchQuery } from "./queryBuilder";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // ---- Parse diklat (same logic as old implementation)
    const diklatRaw = searchParams.get("diklat");

    const diklat = diklatRaw
      ? diklatRaw.includes(",")
        ? diklatRaw.split(",")
        : [diklatRaw]
      : [];

    // ---- Execute analytics query through Prisma
    const data = await fetchQuery(prisma, {
      metric: searchParams.get("metric"),
      groupBy: searchParams.get("groupBy"),
      timeGrain: searchParams.get("timeGrain"),
      filters: {
        kab: searchParams.get("kab"),
        kec: searchParams.get("kec"),
        year: searchParams.get("year"),
        jenjang: searchParams.get("jenjang"),
        diklat, // ← keep this, your new example removed it
      },
    });

    return NextResponse.json(data);

  } catch (error) {
    console.error("Dashboard Analytics Error:", error);

    return NextResponse.json(
      { error: error.message || "Gagal memuat data analitik" },
      { status: 500 }
    );
  }
}
