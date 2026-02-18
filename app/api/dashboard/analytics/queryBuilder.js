import { Prisma } from "@prisma/client";
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

export function timeSelect(grain) {
  switch (grain) {
    case TIME_GRAIN.YEAR:
      return `CAST(EXTRACT(YEAR FROM end_date) AS VARCHAR)`;
    case TIME_GRAIN.QUARTER:
      return `'Q' || EXTRACT(QUARTER FROM end_date)`;
    case TIME_GRAIN.MONTH:
      return `TO_CHAR(end_date, 'YYYY-MM')`;
    default:
      return null;
  }
}

export function buildContext({ kab, kec, year, jenjang, diklat }) {
  const where = [];
  const values = [];
  let i = 1;

  if (kab && KAB_CODE_TO_NAME[kab]) {
    where.push(`UPPER(kabupaten) LIKE $${i++}`);
    values.push(`%${KAB_CODE_TO_NAME[kab]}%`);
  }

  if (kec) {
    where.push(`UPPER(kecamatan) LIKE $${i++}`);
    values.push(`%${kec.toUpperCase()}%`);
  }

  if (year) {
    where.push(`EXTRACT(YEAR FROM end_date) = $${i++}`);
    values.push(Number(year));
  }

  if (jenjang) {
    where.push(`UPPER(bentuk_pendidikan) LIKE $${i++}`);
    values.push(`%${jenjang.toUpperCase()}%`);
  }

  if (diklat?.length) {
    const placeholders = diklat.map((_, idx) => `$${i + idx}`).join(",");
    where.push(`judul_diklat = ANY(ARRAY[${placeholders}])`);
    diklat.forEach((d) => values.push(d.trim()));
    i += diklat.length;
  }

  return {
    where: where.length ? `WHERE ${where.join(" AND ")}` : "",
    values,
  };
}


export function buildQuery({
  metric,
  groupBy,
  timeGrain = TIME_GRAIN.NONE,
  filters = {},
}) {
  const context = buildContext(filters);

  let where = context.where;
  const values = context.values;

  const selectParts = [];
  const groupParts = [];

  // ---- metric condition
  const addCondition = (cond) => {
    where += where ? " AND " : "WHERE ";
    where += cond;
  };

  switch (metric) {
    case METRIC.PTK:
      break;
    case METRIC.ALUMNI:
      addCondition(`is_sudah_pelatihan = true`);
      break;
    case METRIC.UNTRAINED:
      addCondition(`(is_sudah_pelatihan = false OR is_sudah_pelatihan IS NULL)`);
      break;
    default:
      throw new Error("Invalid metric");
  }

  selectParts.push(`COUNT(DISTINCT nik)::int AS value`);

  // ---- time grain
  const timeExpr = timeSelect(timeGrain);
  if (timeExpr) {
    selectParts.unshift(`${timeExpr} AS time`);
    groupParts.push(`time`);
  }

  // ---- group by
  if (groupBy) {
    const groupColumn = GROUP_BY[groupBy.toUpperCase()];
    if (!groupColumn) throw new Error("Unsupported groupBy");

    const groupExpr = `COALESCE(${groupColumn}, 'Lainnya')`;

    selectParts.unshift(`${groupExpr} AS name`);
    groupParts.push(`name`);
  }

  return {
    sql: `
      SELECT
        ${selectParts.join(",\n        ")}
      FROM mv_dashboard_analitik
      ${where}
      ${groupParts.length ? `GROUP BY ${groupParts.join(", ")}` : ""}
    `,
    values,
  };
}

export async function fetchQuery(prisma, args) {
  const { sql: query, values: params } = buildQuery(args);

  try {
    const results = await prisma.$queryRawUnsafe(query, ...params);
    return results;
  } catch (error) {
    console.error("Analytics Error:", error);
    throw new Error("Gagal mengambil data analitik");
  }
}

