"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation"; 
import Link from "next/link"; 
import { Loader2, ArrowLeft } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; 

import ModeSwitcherPTK from "./section/ModeSwitcherPTK";
import InformasiUtama from "./section/InformasiUtama";
import RiwayatPelatihan from "./section/RiwayatPelatihan";
import Indentitas from "./section/Indentitas";
import Kontak from "./section/Kontak";
import Wilayah from "./section/Wilayah";
import Kepegawaian from "./section/Kepegawaian";
import RiwayatPendidikanSertifikasi from "./section/RiwayatPendidikanSertifikasi";

export default function DetailPTK() {
  const router = useRouter(); 
  const params = useParams();
  const { nik } = params; 

  const [mode, setMode] = useState("terpusat");
  const [loading, setLoading] = useState(true);
  const [ptkData, setPtkData] = useState(null);

  useEffect(() => {
    if (!nik) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/ptk/${nik}`);
        
        if (!res.ok) throw new Error("Gagal mengambil data PTK");
        
        const json = await res.json();
        setPtkData(json);
      } catch (error) {
        console.error("Error fetching PTK:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [nik]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dateString.split("T")[0];
  };

  const transformData = (data) => {
    if (!data || !data.profil) return null;

    const { profil, history } = data;

    return {
      informasiUtama: {
        nama_lengkap: profil.nama_ptk,
        nik: profil.nik,
        nuptk: profil.nuptk || "-",
        nip: profil.nip || "-",
        jenis_ptk: profil.jenis_ptk,
        jabatan_ptk: profil.jabatan_ptk,
        status_kepegawaian: profil.status_kepegawaian,
        pernah_pelatihan: history && history.length > 0,
      },
      riwayatPelatihan: history.map((item) => ({
        id: item.diklat_id,
        nama: item.judul_diklat,
        tahun: item.start_date ? new Date(item.start_date).getFullYear() : "-",
        angkatan: item.category_name,
        status: item.status_kelulusan,
        nilai_akhir: item.nilai_akhir || "-",
      })),
      identitas: {
        jenis_kelamin: profil.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan",
        tempat_lahir: profil.tempat_lahir,
        tanggal_lahir: formatDate(profil.tanggal_lahir),
        agama: profil.agama || "-",
      },
      kontak: {
        no_hp: profil.no_hp || "-",
        email: profil.email || "-",
      },
      wilayah: {
        kode_pos: profil.kode_pos || "-",
        kecamatan: profil.kecamatan,
        kabupaten_kota: profil.kabupaten,
        npsn: profil.npsn,
      },
      kepegawaian: {
        pangkat_golongan: profil.pangkat_golongan || "-",
        sk_cpns: profil.sk_cpns || "-",
        tanggal_cpns: formatDate(profil.tgl_cpns),
        sk_pengangkatan: profil.sk_pengangkatan || "-",
        tmt_pengangkatan: formatDate(profil.tmt_pengangkatan),
        tmt_tugas: formatDate(profil.tmt_tugas),
        masa_kerja: `${profil.masa_kerja_tahun} Tahun`,
      },
      riwayatPendidikanSertifikasi: {
        jenjang_terakhir: profil.riwayat_pend_jenjang,
        bidang_pendidikan: profil.riwayat_pend_bidang,
        sertifikasi: profil.riwayat_sertifikasi || "Belum Sertifikasi",
        tugas_tambahan: profil.tugas_tambahan,
      },
    };
  };

  const mappedData = transformData(ptkData);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
        <span className="ml-2 text-slate-500">Memuat data PTK...</span>
      </div>
    );
  }

  if (!ptkData) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
        <Link href="/ptk">
            <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
            </Button>
        </Link>
        <div className="text-center py-10">
            <h1 className="text-xl font-bold text-red-500">Data PTK tidak ditemukan</h1>
            <p className="text-slate-500">Pastikan NIK {nik} sudah benar.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      
      {/* === BUTTON BACK === */}
      <div>
        <Button 
            variant="ghost" 
            className="pl-0 hover:bg-transparent hover:text-blue-600 text-slate-500"
            onClick={() => router.back()} 
        >
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </div>

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
        pusat={mappedData?.informasiUtama}
        pelita={null} 
      />
      <RiwayatPelatihan
        mode={mode}
        pusat={mappedData?.riwayatPelatihan}
        pelita={[]}
      />
      <Indentitas
        mode={mode}
        pusat={mappedData?.identitas}
        pelita={null}
      />
      <Kontak
        mode={mode}
        pusat={mappedData?.kontak}
        pelita={null}
      />
      <Wilayah
        mode={mode}
        pusat={mappedData?.wilayah}
        pelita={null}
      />
      <Kepegawaian
        mode={mode}
        pusat={mappedData?.kepegawaian}
        pelita={null}
      />
      <RiwayatPendidikanSertifikasi
        mode={mode}
        pusat={mappedData?.riwayatPendidikanSertifikasi}
        pelita={null}
      />
    </main>
  );
}