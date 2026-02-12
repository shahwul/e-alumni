// components/UploadPeserta/UploadPeserta.jsx
"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";

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
  } = useUploadLogic(diklatId, onSuccess);

  const rowRefs = useRef(new Map());

  const hasData = parsedData.length > 0;
  const validCount = parsedData.filter((p) => p.isValid).length;
  const duplicateCount = parsedData.filter((p) => p.isDuplicate).length;
  const registeredCount = parsedData.filter(p => 
    !p.isValid && p.status_msg && p.status_msg.toLowerCase().includes("sudah terdaftar")
  ).length;

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

          {/* 3. FOOTER ACTIONS */}
          <div className="flex justify-end pt-4 border-t mt-4 gap-3 sticky bottom-0 bg-white/90 backdrop-blur pb-2">
            {needsRevalidation && (
              <Button
                variant="outline"
                onClick={() => validateData(parsedData)}
                disabled={isValidating}
                className="border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100"
              >
                {isValidating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />} Validasi Ulang
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={isUploading || needsRevalidation || validCount === 0}
              className="bg-green-600 hover:bg-green-700 shadow-sm"
            >
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Simpan {validCount} Data
            </Button>
          </div>
        </>
      )}
    </div>
  );
}