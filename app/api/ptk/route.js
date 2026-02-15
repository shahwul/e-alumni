import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { buildPrismaQuery } from "./queryBuilder";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const { 
        where, 
        orderBy, 
        page, 
        limit, 
        hasDiklatFilter, 
        modeFilter 
    } = await buildPrismaQuery(searchParams, prisma);

    if (!hasDiklatFilter && modeFilter === "history") {
      return NextResponse.json({
        meta: { page, limit, totalData: 0, totalPage: 0 },
        data: [],
      });
    }

    const distinctGroups = await prisma.mv_dashboard_analitik.groupBy({
      by: ['nik'],
      where: where,
    });
    const totalData = distinctGroups.length; 
    
    const totalPage = Math.ceil(totalData / limit);
    const skip = (page - 1) * limit;

    const data = await prisma.mv_dashboard_analitik.findMany({
      where: where,
      distinct: ['nik'], 
      orderBy: orderBy,
      take: limit,
      skip: skip,
    });

    return NextResponse.json({
      meta: {
        page,
        limit,
        totalData,
        totalPage,
      },
      data,
    });

  } catch (error) {
    console.error("Error API PTK:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}