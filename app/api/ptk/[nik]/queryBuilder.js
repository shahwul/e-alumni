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
    "dp.nik",
    "dp.nama_ptk",
    "dp.nuptk",
    "dp.nip",
    "dp.jenis_ptk",
    "dp.jabatan_ptk",
    "dp.status_kepegawaian",
    "dp.jenis_kelamin",
    "dp.tempat_lahir",
    "dp.tanggal_lahir",
    "dp.agama",
    "dp.no_hp",
    "dp.email",
    "dp.kode_pos",
    "dp.pangkat_golongan",
    "dp.sk_cpns",
    "dp.tgl_cpns",
    "dp.sk_pengangkatan",
    "dp.tmt_pengangkatan",
    "dp.tmt_tugas",
    "dp.masa_kerja_tahun",
    "dp.riwayat_pend_jenjang",
    "dp.riwayat_pend_bidang",
    "dp.riwayat_sertifikasi",
    "dp.tugas_tambahan",
    "dp.npsn",
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
