"use client";
import React, { useState } from "react";
import { Loader2, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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
  const { data, loading, error, isSyncing, syncData } = useDetailPTK(nik);
  const [mode, setMode] = useState("terpusat");

  const handleSyncManual = async () => {
    const npsn = data?.terpusat?.wilayah?.npsn;
    const result = await syncData(npsn);
    
    if (result?.success) {
      console.log("Sinkronisasi Berhasil!");
    } else if (result?.message) {
      alert(result.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-slate-500">Memuat data PTK...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-red-500 font-medium">Gagal memuat data: {error}</p>
        <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
      </div>
    );
  }

  if (!data || !data.terpusat) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Data PTK tidak ditemukan.</p>
      </div>
    );
  }

  const isPelitaAvailable = !!data.pelita;
  const pelitaData = data.pelita || {};
  const lastSync = data.terpusat.informasiUtama?.last_sync;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          className="pl-0 hover:bg-transparent hover:text-blue-600 text-slate-500"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>

        {/* --- Bagian Last Sync & Button --- */}
        <div className="flex items-center gap-4">
          {lastSync && (
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Update Terakhir
              </span>
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                {new Date(lastSync).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleSyncManual}
            disabled={isSyncing}
            className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-sm transition-all"
          >
            {isSyncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {isSyncing ? "Menyinkronkan..." : "Sinkronkan"}
          </Button>
        </div>
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
        <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md text-sm border border-yellow-100">
          Data Pelita (Alumni) belum tersedia untuk PTK ini. Menampilkan data
          kosong.
        </div>
      )}

      {/* Sections */}
      <div className="space-y-6">
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
      </div>
    </main>
  );
}