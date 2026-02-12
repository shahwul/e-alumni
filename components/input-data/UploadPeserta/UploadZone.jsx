// components/UploadPeserta/UploadZone.jsx
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, CloudUpload, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { downloadTemplatePeserta } from "../utils/excel-processor";

export function UploadZone({ onFileSelect, diklatTitle, isValidating, hasData }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDownloadTemplate = () => {
    downloadTemplatePeserta(diklatTitle || "Diklat");
    toast.success("Template berhasil diunduh");
  };

  const handleDragOver = (e) => { e.preventDefault(); if (!hasData) setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (hasData) return;
    if (e.dataTransfer.files?.length > 0) onFileSelect(e.dataTransfer.files[0]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-800">Upload Data Peserta</h3>
        <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="h-8">
          <Download className="mr-2 h-3.5 w-3.5" /> Template Excel
        </Button>
      </div>

      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 transition-all duration-200 flex flex-col items-center justify-center gap-3",
          hasData
            ? "border-slate-200 bg-slate-50 cursor-default opacity-80"
            : "cursor-pointer border-slate-300 hover:border-blue-400 hover:bg-slate-50",
          isDragging && !hasData ? "border-blue-500 bg-blue-50/50 scale-[0.99]" : "",
          isValidating ? "opacity-50 pointer-events-none" : ""
        )}
        onDragOver={!hasData ? handleDragOver : undefined}
        onDragLeave={!hasData ? handleDragLeave : undefined}
        onDrop={!hasData ? handleDrop : undefined}
        onClick={() => !hasData && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept=".xlsx, .xls"
          className="hidden"
          onChange={(e) => onFileSelect(e.target.files[0])}
          disabled={hasData}
        />

        <div className={cn("p-4 rounded-full transition-colors", hasData ? "bg-slate-200" : "bg-slate-100")}>
          {isValidating ? (
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          ) : hasData ? (
            <FileSpreadsheet className="h-8 w-8 text-green-600" />
          ) : (
            <CloudUpload className="h-8 w-8 text-slate-400" />
          )}
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-slate-700">
            {isValidating
              ? "Sedang Memvalidasi Data..."
              : hasData
              ? "File Siap Diproses"
              : "Klik atau Drag file Excel ke sini"}
          </p>
          <p className="text-xs text-slate-500">
            {hasData ? "Reset tabel jika ingin mengganti file." : "Format .xlsx (Gunakan Template)"}
          </p>
        </div>
      </div>
    </div>
  );
}