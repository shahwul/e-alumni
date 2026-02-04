import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { buildQuery } from "./queryBuilder.js";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const query = buildQuery({
    metric: searchParams.get("metric"),
    groupBy: searchParams.get("groupBy"),
    filters: {
      kab: searchParams.get("kab"),
      kec: searchParams.get("kec"),
      year: searchParams.get("year"),
      jenjang: searchParams.get("jenjang"),
    }
  });

  const result = await pool.query(query.sql, query.values);

  return NextResponse.json(result.rows);
}