import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fetchAnalyticsData } from "./queryBuilder.js";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const data = await fetchAnalyticsData(prisma, {
      metric: searchParams.get("metric"),
      groupBy: searchParams.get("groupBy"),
      timeGrain: searchParams.get("timeGrain"),
      filters: {
        kab: searchParams.get("kab"),
        kec: searchParams.get("kec"),
        year: searchParams.get("year"),
        jenjang: searchParams.get("jenjang"),
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