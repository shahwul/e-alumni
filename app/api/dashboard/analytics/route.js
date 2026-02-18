import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { buildQuery } from "./queryBuilder.js";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  //Parse string
  const diklatRaw = searchParams.get("diklat");
  const diklat = diklatRaw
    ? diklatRaw.includes(",")
      ? diklatRaw.split(",")
      : [diklatRaw]
    : [];

  const query = buildQuery({
    metric: searchParams.get("metric"),
    groupBy: searchParams.get("groupBy"),
    timeGrain: searchParams.get("timeGrain"),
    filters: {
      kab: searchParams.get("kab"),
      kec: searchParams.get("kec"),
      year: searchParams.get("year"),
      jenjang: searchParams.get("jenjang"),
      diklat: diklat,
    },
  });

  // console.log("Executing query:", query.sql, "with values:", query.values);

  const result = await pool.query(query.sql, query.values);

  return NextResponse.json(result.rows);
}
