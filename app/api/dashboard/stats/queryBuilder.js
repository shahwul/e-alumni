import KAB_CODE_TO_NAME from "../../../lib/constants.js";

export const METRIC = {
  PTK: "ptk",
  ALUMNI: "alumni",
  UNTRAINED: "untrained"
};

export const TIME_GRAIN = {
  NONE: null,
  YEAR: "year",
  QUARTER: "quarter",
  MONTH: "month"
};

export const GROUP_BY = {
  KABUPATEN: "kabupaten",
  KECAMATAN: "kecamatan",
  JABATAN: "jabatan_ptk",
  SEKOLAH: "nama_sekolah"
};

export function timeSelect(grain) {
  switch (grain) {
    case "year":
      return `EXTRACT(YEAR FROM end_date)::text`;
    case "quarter":
      return `'Q' || EXTRACT(QUARTER FROM end_date)`;
    case "month":
      return `TO_CHAR(end_date, 'YYYY-MM')`;
    default:
      return null;
  }
}

export function buildContext({kab, kec, year}) { 
  const where = [];
  const values = [];
  let i = 1;


  if (kab && KAB_CODE_TO_NAME[kab]) {
    where.push(`UPPER(kabupaten) LIKE $${i++}`);
    values.push(`%${KAB_CODE_TO_NAME[kab]}%`);
  }

  if (kec){
    where.push(`UPPER(kecamatan) LIKE $${i++}`);
    values.push(`%${kec.toUpperCase()}%`);
  }

  if (year) {
    values.push(year);
  }

  return {
    where: where.length ? `WHERE ${where.join(" AND ")}` : "",
    values
  };
}

export function buildQuery({metric, groupby, timeGrain = TIME_GRAIN.NONE, filters = {}}) {
  const context = buildContext(filters);

  let where = context.where;
  let values = context.values;

  switch (metric) {
    case METRIC.PTK:
      selectParts.push(`COUNT(*) AS value`);
      break;
    case METRIC.ALUMNI:
      where += where ? " AND " : "WHERE ";
      where += "is_sudah_pelatihan = true";
      selectParts.push(`COUNT(*) AS value`);
      break;
    case METRIC.UNTRAINED:
      where += where ? " AND " : "WHERE ";
      where += "(is_sudah_pelatihan = false OR is_sudah_pelatihan IS NULL)";
      selectParts.push(`COUNT(*) AS value`);
      break;
    default:
      throw new Error("Invalid metric");
  }
}