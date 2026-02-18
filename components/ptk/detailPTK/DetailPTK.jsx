"use client";
import React, { useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

//hooks
import { useDetailPTK } from "./useDetailPTK";

import ModeSwitcherPTK from "./section/ModeSwitcherPTK";
import InformasiUtama from "./section/InformasiUtama";
import RiwayatPelatihan from "./section/RiwayatPelatihan";
import Indentitas from "./section/Indentitas";
import Kontak from "./section/Kontak";
import Wilayah from "./section/Wilayah";
import Kepegawaian from "./section/Kepegawaian";
import RiwayatPendidikanSertifikasi from "./section/RiwayatPendidikanSertifikasi";

export default function DetailPTK({ nik }) {
  const router = useRouter();
  const { data, loading, error } = useDetailPTK(nik);

  const [mode, setMode] = useState("terpusat");
  // === HANDLING LOADING STATE ===
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-slate-500">Memuat data PTK...</p>
      </div>
    );
  }

  // === HANDLING ERROR STATE ===
  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-red-500 font-medium">Gagal memuat data: {error}</p>
        <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
      </div>
    );
  }

  // === HANDLING DATA KOSONG ===
  if (!data || !data.terpusat) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Data PTK tidak ditemukan.</p>
      </div>
    );
  }

  const isPelitaAvailable = !!data.pelita;

  const pelitaData = data.pelita || {};

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      <div>
        <Button
          variant="ghost"
          className="pl-0 hover:bg-transparent hover:text-blue-600 text-slate-500"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Detail Informasi PTK
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Informasi lengkap identitas, kepegawaian, dan riwayat pelatihan
          </p>
        </div>
      </div>

      <ModeSwitcherPTK
        mode={mode}
        setMode={setMode}
        disabled={!isPelitaAvailable}
      />

      {!isPelitaAvailable && mode === "pelita" && (
        <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md text-sm">
          Data Pelita (Alumni) belum tersedia untuk PTK ini. Menampilkan data
          kosong.
        </div>
      )}

      <InformasiUtama
        mode={mode}
        pusat={data.terpusat.informasiUtama}
        pelita={pelitaData?.informasiUtama}
      />
      <RiwayatPelatihan
        mode={mode}
        pusat={data.terpusat.riwayatPelatihan}
        pelita={pelitaData?.riwayatPelatihan}
      />
      <Indentitas
        mode={mode}
        pusat={data.terpusat.identitas}
        pelita={pelitaData?.identitas}
      />
      <Kontak
        mode={mode}
        pusat={data.terpusat.kontak}
        pelita={pelitaData?.kontak}
      />
      <Wilayah
        mode={mode}
        pusat={data.terpusat.wilayah}
        pelita={pelitaData?.wilayah}
      />
      <Kepegawaian
        mode={mode}
        pusat={data.terpusat.kepegawaian}
        pelita={pelitaData?.kepegawaian}
      />
      <RiwayatPendidikanSertifikasi
        mode={mode}
        pusat={data.terpusat.riwayatPendidikanSertifikasi}
        pelita={pelitaData?.riwayatPendidikanSertifikasi}
      />
    </main>
  );
}
