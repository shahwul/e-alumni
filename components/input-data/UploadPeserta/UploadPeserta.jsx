"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Save, AlertCircle, Info } from "lucide-react"; // Tambah icon alert
import { toast } from "sonner";
import { cn } from "@/lib/utils"; // Pastikan import cn untuk styling dinamis

import { useUploadLogic } from "./useUploadLogic";
import { UploadZone } from "./UploadZone";
import { StatsToolbar } from "./StatsToolbar";
import { PesertaTable } from "./PesertaTable";

export default function UploadPeserta({ diklatId, diklatTitle, onSuccess }) {
  const {
    parsedData,
    setParsedData,
    isValidating,
    isUploading,
    validationDone,
    needsRevalidation,
    processFile,
    validateData,
    handleCellChange,
    handleSyncData,
    handleDeleteRow,
    handleSave,
    sisaQuota, // Dari hook
    fetchQuota
  } = useUploadLogic(diklatId, onSuccess);

  const rowRefs = useRef(new Map());

  const hasData = parsedData.length > 0;
  const validCount = parsedData.filter((p) => p.isValid).length;
  const duplicateCount = parsedData.filter((p) => p.isDuplicate).length;
  const registeredCount = parsedData.filter(p => 
    !p.isValid && p.status_msg && p.status_msg.toLowerCase().includes("sudah terdaftar")
  ).length;

  // Logika pengecekan kuota
  const isOverQuota = sisaQuota !== Infinity && validCount > sisaQuota;

  const scrollToRow = (index) => {
    const node = rowRefs.current.get(index);
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      node.classList.add("bg-yellow-100");
      setTimeout(() => node.classList.remove("bg-yellow-100"), 1500);
    } else {
      toast.info(`Baris ${index + 1} ada di halaman lain`);
    }
  };

  const scrollToFirstDuplicate = () => {
    const firstIndex = parsedData.findIndex((p) => p.isDuplicate);
    if (firstIndex !== -1) {
      scrollToRow(firstIndex);
      toast.info("Menuju baris duplikat pertama");
    }
  };

  const scrollToFirstInvalid = () => {
    const firstIndex = parsedData.findIndex(p => 
      !p.isValid && 
      !p.isDuplicate && 
      !(p.status_msg && p.status_msg.toLowerCase().includes("sudah terdaftar"))
    );

    if (firstIndex !== -1) {
        scrollToRow(firstIndex);
        toast.info("Menuju data error pertama");
    } else {
        toast.info("Tidak ada data error ditemukan");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. AREA UPLOAD */}
      <UploadZone
        onFileSelect={processFile}
        diklatTitle={diklatTitle}
        isValidating={isValidating}
        hasData={hasData}
      />

      {/* 2. TABLE VIEW */}
      {hasData && (
        <>
          <StatsToolbar
            total={parsedData.length}
            validCount={validCount}
            duplicateCount={duplicateCount}
            registeredCount={registeredCount}
            validationDone={validationDone}
            onReset={() => setParsedData([])}
            onScrollDuplicate={scrollToFirstDuplicate}
            onScrollInvalid={scrollToFirstInvalid}
          />

          <PesertaTable
            data={parsedData}
            onCellChange={handleCellChange}
            onSync={handleSyncData}
            onDelete={handleDeleteRow}
            onScrollTo={scrollToRow}
            rowRefs={rowRefs}
          />

          {/* 3. FOOTER ACTIONS DENGAN INFO KUOTA */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t mt-4 gap-4 sticky bottom-0 bg-white/95 backdrop-blur pb-4 px-2">
            
            {/* INDIKATOR KUOTA (Sisi Kiri) */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-600">Sisa Kuota Diklat:</span>
                <span className={cn(
                  "text-xs font-bold px-2.5 py-0.5 rounded-full border",
                  isOverQuota 
                    ? "bg-red-50 text-red-700 border-red-100" 
                    : "bg-blue-50 text-blue-700 border-blue-100"
                )}>
                  {sisaQuota === Infinity ? "Unlimited" : `${sisaQuota} Orang`}
                </span>
              </div>
              
              {isOverQuota && (
                <div className="flex items-center gap-1.5 text-red-600 animate-in slide-in-from-left-2 duration-300">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-semibold italic">
                    Kelebihan {validCount - sisaQuota} data! Hapus beberapa baris.
                  </span>
                </div>
              )}
            </div>

            {/* TOMBOL ACTIONS (Sisi Kanan) */}
            <div className="flex gap-3 w-full sm:w-auto">
              {needsRevalidation && (
                <Button
                  variant="outline"
                  onClick={() => validateData(parsedData)}
                  disabled={isValidating}
                  className="border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100 flex-1 sm:flex-none"
                >
                  {isValidating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />} 
                  Validasi Ulang
                </Button>
              )}
              
              <Button
                onClick={handleSave}
                // Tombol mati kalau: sedang upload, butuh validasi ulang, data kosong, ATAU kelebihan kuota
                disabled={isUploading || needsRevalidation || validCount === 0 || isOverQuota}
                className={cn(
                  "flex-1 sm:flex-none shadow-sm transition-all duration-300",
                  isOverQuota 
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed hover:bg-slate-300" 
                    : "bg-green-600 hover:bg-green-700 text-white"
                )}
              >
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Simpan {validCount} Data
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}