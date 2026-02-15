import { KAB_CODE_TO_NAME } from "@/lib/constants";

export const METRIC = {
  PTK: "ptk",
  ALUMNI: "alumni",
  UNTRAINED: "untrained",
};

export const TIME_GRAIN = {
  NONE: null,
  YEAR: "year",
  QUARTER: "quarter",
  MONTH: "month",
};

export const GROUP_BY = {
  KABUPATEN: "kabupaten",
  KECAMATAN: "kecamatan",
  STATUS_KEPEGAWAIAN: "status_kepegawaian",
  JABATAN: "jabatan_ptk",
  SEKOLAH: "nama_sekolah",
  JENJANG: "bentuk_pendidikan",
};

function buildWhereClause(filters, metric) {
  const conditions = ["1=1"]; 
  const params = [];
  let paramCounter = 1;

  if (metric === METRIC.ALUMNI) {
    conditions.push(`is_sudah_pelatihan = true`);
  } else if (metric === METRIC.UNTRAINED) {
    conditions.push(`(is_sudah_pelatihan = false OR is_sudah_pelatihan IS NULL)`);
  }

  const { kab, kec, year, jenjang } = filters;

  if (kab && KAB_CODE_TO_NAME[kab]) {
    conditions.push(`UPPER(kabupaten) LIKE $${paramCounter++}`);
    params.push(`%${KAB_CODE_TO_NAME[kab]}%`);
  }

  if (kec) {
    conditions.push(`UPPER(kecamatan) LIKE $${paramCounter++}`);
    params.push(`%${kec.toUpperCase()}%`);
  }

  if (year) {
    conditions.push(`EXTRACT(YEAR FROM end_date) = $${paramCounter++}`);
    params.push(parseInt(year));
  }

  if (jenjang) {
    conditions.push(`UPPER(bentuk_pendidikan) LIKE $${paramCounter++}`);
    params.push(`%${jenjang.toUpperCase()}%`);
  }

  return {
    clause: `WHERE ${conditions.join(" AND ")}`,
    params,
    nextIndex: paramCounter
  };
}
export async function fetchAnalyticsData(prisma, { metric, groupBy, timeGrain, filters }) {
  const { clause: whereClause, params } = buildWhereClause(filters, metric);
  const selectParts = [`COUNT(DISTINCT nik)::int AS value`];
  const groupParts = [];

  if (timeGrain) {
    let timeExpr = "";
    switch (timeGrain) {
      case TIME_GRAIN.YEAR:
        timeExpr = `CAST(EXTRACT(YEAR FROM end_date) AS VARCHAR)`;
        break;
      case TIME_GRAIN.QUARTER:
        timeExpr = `'Q' || EXTRACT(QUARTER FROM end_date)`;
        break;
      case TIME_GRAIN.MONTH:
        timeExpr = `TO_CHAR(end_date, 'YYYY-MM')`;
        break;
    }
    
    if (timeExpr) {
      selectParts.unshift(`${timeExpr} AS time`);
      groupParts.push(`time`); 
    }
  }

  if (groupBy) {
    const column = GROUP_BY[groupBy.toUpperCase()];
    if (!column) throw new Error("Unsupported groupBy");

    const groupExpr = `COALESCE(${column}, 'Lainnya')`;
    
    selectParts.unshift(`${groupExpr} AS name`);
    groupParts.push(`name`);
  }

  const groupByClause = groupParts.length > 0 ? `GROUP BY ${groupParts.join(", ")}` : "";
  const orderByClause = timeGrain ? `ORDER BY time ASC` : `ORDER BY value DESC`;

  const query = `
    SELECT 
      ${selectParts.join(", ")}
    FROM mv_dashboard_analitik
    ${whereClause}
    ${groupByClause}
    ${orderByClause}
  `;

  try {
    const results = await prisma.$queryRawUnsafe(query, ...params);
    return results;
  } catch (error) {
    console.error("Analytics Error:", error);
    throw new Error("Gagal mengambil data analitik");
  }
}