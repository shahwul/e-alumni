// lib/builders/ptkQueryBuilder.js

export const PTK_QUERY_TYPE = {
  PROFIL: "profil",
  RIWAYAT: "riwayat",
  RIWAYAT_DETAIL: "riwayat_detail",
  ALUMNI: "alumni",
};

// Mapping kolom agar kode lebih bersih
const COLUMN_MAP = {
  [PTK_QUERY_TYPE.PROFIL]: [
    "dp.*",
    "sp.nama as nama_sekolah",
    "rw.kecamatan",
    "rw.kabupaten",
  ],
  [PTK_QUERY_TYPE.RIWAYAT]: [
    "md.id",
    "md.title as nama",
    "TO_CHAR(md.start_date, 'YYYY') as tahun",
    "md.category_id as angkatan_raw",
    "da.status_kelulusan as status",
    "da.nilai_akhir",
  ],
  [PTK_QUERY_TYPE.RIWAYAT_DETAIL]: [
    "md.id",
    "md.course_code",
    "md.title as judul_diklat",
    "md.start_date",
    "md.end_date",
    "md.total_jp",
    "md.location",
    "da.status_kelulusan",
    "da.no_sertifikat",
    "da.nilai_akhir",
    "cat.category_name",
    "mode.mode_name",
  ],
  [PTK_QUERY_TYPE.ALUMNI]: ["*"],
};

export function buildPtkQuery({ type, nik }) {
  if (!nik) throw new Error("NIK required");

  const values = [nik];
  let sql = "";

  switch (type) {
    case PTK_QUERY_TYPE.PROFIL:
      sql = `
        SELECT ${COLUMN_MAP[type].join(", ")}
        FROM data_ptk dp
        LEFT JOIN satuan_pendidikan sp ON dp.npsn = sp.npsn
        LEFT JOIN ref_wilayah rw ON TRIM(sp.kode_kecamatan) = TRIM(rw.kode_kecamatan)
        WHERE dp.nik = $1
      `;
      break;

    case PTK_QUERY_TYPE.RIWAYAT:
      sql = `
        SELECT ${COLUMN_MAP[type].join(", ")}
        FROM data_alumni da
        JOIN master_diklat md ON da.id_diklat = md.id
        WHERE da.nik = $1
        ORDER BY md.start_date DESC
      `;
      break;

    case PTK_QUERY_TYPE.RIWAYAT_DETAIL:
      sql = `
        SELECT ${COLUMN_MAP[type].join(", ")}
        FROM data_alumni da
        JOIN master_diklat md ON da.id_diklat = md.id
        LEFT JOIN ref_kategori cat ON md.category_id = cat.id
        LEFT JOIN ref_mode mode ON md.mode_id = mode.id
        WHERE da.nik = $1
        ORDER BY md.start_date DESC
      `;
      break;

    case PTK_QUERY_TYPE.ALUMNI:
      sql = `
        SELECT ${COLUMN_MAP[type].join(", ")} 
        FROM data_alumni 
        WHERE nik = $1 
        ORDER BY created_at DESC LIMIT 1
      `;
      break;

    default:
      throw new Error("Invalid Query Type");
  }

  return { sql, values };
}
