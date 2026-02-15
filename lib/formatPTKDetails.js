// lib/formatters/ptkFormatter.js

const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString().split("T")[0];
};

const useAlumniOrFallBack = (valAlumni, valAsli) => {
  if (valAlumni !== null && valAlumni !== undefined && valAlumni !== "") {
    return valAlumni;
  }
  return valAsli;
};

export const formatTerpusat = (ptk, listPelatihan) => {
  if (!ptk) return null;

  return {
    informasiUtama: {
      nama_lengkap: ptk.nama_ptk,
      nik: ptk.nik,
      nuptk: ptk.nuptk,
      nip: ptk.nip,
      jenis_ptk: ptk.jenis_ptk,
      jabatan_ptk: ptk.jabatan_ptk,
      status_kepegawaian: ptk.status_kepegawaian,
      pernah_pelatihan: listPelatihan.length > 0,
    },
    riwayatPelatihan: listPelatihan,
    identitas: {
      jenis_kelamin: ptk.jenis_kelamin,
      tempat_lahir: ptk.tempat_lahir,
      tanggal_lahir: formatDate(ptk.tanggal_lahir),
      agama: ptk.agama,
    },
    kontak: {
      no_hp: ptk.no_hp,
      email: ptk.email,
    },
    wilayah: {
      kode_pos: ptk.kode_pos,
      kecamatan: ptk.kecamatan,
      kabupaten_kota: ptk.kabupaten,
      npsn: ptk.npsn,
      nama_sekolah: ptk.nama_sekolah,
    },
    kepegawaian: {
      pangkat_golongan: ptk.pangkat_golongan,
      sk_cpns: ptk.sk_cpns,
      tanggal_cpns: formatDate(ptk.tgl_cpns),
      sk_pengangkatan: ptk.sk_pengangkatan,
      tmt_pengangkatan: formatDate(ptk.tmt_pengangkatan),
      tmt_tugas: formatDate(ptk.tmt_tugas),
      masa_kerja: `${ptk.masa_kerja_tahun || 0} Tahun`,
    },
    riwayatPendidikanSertifikasi: {
      jenjang_terakhir: ptk.riwayat_pend_jenjang,
      bidang_pendidikan: ptk.riwayat_pend_bidang,
      sertifikasi: ptk.riwayat_sertifikasi,
      tugas_tambahan: ptk.tugas_tambahan,
    },
  };
};

export const formatPelita = (ptk, listPelatihan, alumni) => {
  if (!alumni) return null;

  return {
    informasiUtama: {
      nama_lengkap: useAlumniOrFallBack(alumni.nama_peserta, ptk.nama_ptk),
      nik: ptk.nik,
      nuptk: ptk.nuptk,
      nip: ptk.nip,
      jenis_ptk: ptk.jenis_ptk,
      jabatan_ptk: useAlumniOrFallBack(
        alumni.snapshot_jabatan,
        ptk.jabatan_ptk,
      ),
      status_kepegawaian: ptk.status_kepegawaian,
      pernah_pelatihan: listPelatihan.length > 0,
    },
    riwayatPelatihan: listPelatihan,
    identitas: {
      jenis_kelamin: ptk.jenis_kelamin,
      tempat_lahir: ptk.tempat_lahir,
      tanggal_lahir: formatDate(ptk.tanggal_lahir),
      agama: ptk.agama,
    },
    kontak: {
      no_hp: ptk.no_hp,
      email: ptk.email,
    },
    wilayah: {
      kode_pos: ptk.kode_pos,
      kecamatan: ptk.kecamatan,
      kabupaten_kota: ptk.kabupaten,
      npsn: useAlumniOrFallBack(alumni.npsn, ptk.npsn),
      nama_sekolah: useAlumniOrFallBack(
        alumni.snapshot_nama_sekolah,
        ptk.nama_sekolah,
      ),
    },
    kepegawaian: {
      pangkat_golongan: useAlumniOrFallBack(
        alumni.snapshot_pangkat,
        ptk.pangkat_golongan,
      ),
      sk_cpns: ptk.sk_cpns,
      tanggal_cpns: formatDate(ptk.tgl_cpns),
      sk_pengangkatan: ptk.sk_pengangkatan,
      tmt_pengangkatan: formatDate(ptk.tmt_pengangkatan),
      tmt_tugas: formatDate(ptk.tmt_tugas),
      masa_kerja: `${ptk.masa_kerja_tahun || 0} Tahun`,
    },
    riwayatPendidikanSertifikasi: {
      jenjang_terakhir: ptk.riwayat_pend_jenjang,
      bidang_pendidikan: ptk.riwayat_pend_bidang,
      sertifikasi: ptk.riwayat_sertifikasi,
      tugas_tambahan: ptk.tugas_tambahan,
    },
  };
};
