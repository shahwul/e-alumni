"use client";
import React from "react";
import { useState } from "react";

import ModeSwitcherPTK from "./section/ModeSwitcherPTK";

import InformasiUtama from "./section/InformasiUtama";
import RiwayatPelatihan from "./section/RiwayatPelatihan";
import Indentitas from "./section/Indentitas";
import Kontak from "./section/Kontak";
import Wilayah from "./section/Wilayah";
import Kepegawaian from "./section/Kepegawaian";
import RiwayatPendidikanSertifikasi from "./section/RiwayatPendidikanSertifikasi";

const DATA = {
  "terpusat": {
    "informasiUtama": {
      "nama_lengkap": "Ahmad Fauzi",
      "nik": "3275010101900001",
      "nuptk": "1234567890",
      "nip": "198001012005011001",
      "jenis_ptk": "Guru",
      "jabatan_ptk": "Guru BK",
      "status_kepegawaian": "PNS",
      "pernah_pelatihan": true,
    },

    "riwayatPelatihan": [
      {
        "id": "p1",
        "nama": "Pelatihan Kurikulum Merdeka",
        "tahun": "2023",
        "angkatan": "Angkatan 2",
        "status": "Lulus",
        "nilai_akhir": "89",
      },
      {
        "id": "p2",
        "nama": "Pelatihan Asesmen Nasional",
        "tahun": "2022",
        "angkatan": "Angkatan 1",
        "status": "Lulus",
        "nilai_akhir": "92",
      },
    ],

    "identitas": {
      "jenis_kelamin": "Laki-laki",
      "tempat_lahir": "Bandung",
      "tanggal_lahir": "1990-01-01",
      "agama": "Islam",
    },

    "kontak": {
      "no_hp": "081234567890",
      "email": "ahmad.fauzi@sekolah.id",
    },

    "wilayah": {
      "kode_pos": "40123",
      "kecamatan": "Coblong",
      "kabupaten_kota": "Kota Bandung",
      "npsn": "20212345",
    },

    "kepegawaian": {
      "pangkat_golongan": "III/b",
      "sk_cpns": "SK-CPNS-2020-001",
      "tanggal_cpns": "2020-01-01",
      "sk_pengangkatan": "SK-PNS-2020-045",
      "tmt_pengangkatan": "2020-03-01",
      "tmt_tugas": "2020-07-01",
      "masa_kerja": "5 Tahun",
    },

    "riwayatPendidikanSertifikasi": {
      "jenjang_terakhir": "S1",
      "bidang_pendidikan": "Bimbingan dan Konseling",
      "sertifikasi": "Sertifikasi Pendidik (2021)",
      "tugas_tambahan": null,
    },
  },

  "pelita": {
    "informasiUtama": {
      "nama_lengkap": "Ahmad Fauzi, S.Pd",
      "nik": "3275010101900001",
      "nuptk": "1234567890",
      "nip": "198001012005011001",
      "jenis_ptk": "Guru",
      "jabatan_ptk": "Guru Bimbingan Konseling",
      "status_kepegawaian": "PNS",
      "pernah_pelatihan": true,
    },

    "riwayatPelatihan": [
      {
        "id": "p1",
        "nama": "Pelatihan Kurikulum Merdeka",
        "tahun": "2023",
        "angkatan": "Angkatan 2",
        "status": "Lulus",
        "nilai_akhir": "90",
      },
    ],

    "identitas": {
      "jenis_kelamin": "Laki-laki",
      "tempat_lahir": "Bandung",
      "tanggal_lahir": "1990-01-01",
      "agama": "Islam",
    },

    "kontak": {
      "no_hp": "081234567890",
      "email": "ahmad.fauzi@pelita.id",
    },

    "wilayah": {
      "kode_pos": "40123",
      "kecamatan": "Coblong",
      "kabupaten_kota": "Kota Bandung",
      "npsn": "20212345",
    },

    "kepegawaian": {
      "pangkat_golongan": "III/c",
      "sk_cpns": "SK-CPNS-2020-001",
      "tanggal_cpns": "2020-01-01",
      "sk_pengangkatan": "SK-PNS-2020-045",
      "tmt_pengangkatan": "2020-03-01",
      "tmt_tugas": "2020-07-01",
      "masa_kerja": "5 Tahun",
    },

    "riwayatPendidikanSertifikasi": {
      "jenjang_terakhir": "S1",
      "bidang_pendidikan": "Bimbingan dan Konseling",
      "sertifikasi": "Sertifikasi Pendidik (2021)",
      "tugas_tambahan": "Koordinator BK",
    },
  },
};

export default function DetailPTK() {
  const [mode, setMode] = useState("terpusat");

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* === PAGE HEADER === */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Detail Informasi PTK
        </h1>
        <p className="text-sm text-slate-500">
          Informasi lengkap identitas, kepegawaian, dan riwayat pelatihan
        </p>
      </div>

      <ModeSwitcherPTK mode={mode} setMode={setMode} />

      <InformasiUtama
        mode={mode}
        pusat={DATA.terpusat.informasiUtama}
        pelita={DATA.pelita.informasiUtama}
      />
      <RiwayatPelatihan
        mode={mode}
        pusat={DATA.terpusat.riwayatPelatihan}
        pelita={DATA.pelita.riwayatPelatihan}
      />
      <Indentitas
        mode={mode}
        pusat={DATA.terpusat.identitas}
        pelita={DATA.pelita.identitas}
      />
      <Kontak
        mode={mode}
        pusat={DATA.terpusat.kontak}
        pelita={DATA.pelita.kontak}
      />
      <Wilayah
        mode={mode}
        pusat={DATA.terpusat.wilayah}
        pelita={DATA.pelita.wilayah}
      />
      <Kepegawaian
        mode={mode}
        pusat={DATA.terpusat.kepegawaian}
        pelita={DATA.pelita.kepegawaian}
      />
      <RiwayatPendidikanSertifikasi
        mode={mode}
        pusat={DATA.terpusat.riwayatPendidikanSertifikasi}
        pelita={DATA.pelita.riwayatPendidikanSertifikasi}
      />
    </main>
  );
}
