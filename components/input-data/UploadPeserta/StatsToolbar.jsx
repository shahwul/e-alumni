import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, Trash2, XCircle, UserCheck } from "lucide-react"; 
import { cn } from "@/lib/utils";

export function StatsToolbar({ 
  total, 
  validCount, 
  duplicateCount, 
  registeredCount, 
  validationDone, 
  onReset, 
  onScrollDuplicate,
  onScrollInvalid
}) {
  const errorCount = total - validCount - duplicateCount - (registeredCount || 0);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 gap-3">
      <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
        
        {/* 1. TOTAL (Abu-abu) */}
        <div className="px-2.5 py-1 bg-white border rounded text-slate-600 shadow-sm whitespace-nowrap">
          Total: <b>{total}</b>
        </div>

        {/* 2. VALID (Hijau - Selalu Hijau jika ada isinya) */}
        {validationDone && validCount > 0 && (
          <div className="flex items-center px-2.5 py-1 rounded border bg-green-100 text-green-700 border-green-200 shadow-sm whitespace-nowrap transition-colors">
            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
            <b>{validCount}</b> Valid
          </div>
        )}

        {/* 3. SUDAH TERDAFTAR (Biru) */}
        {registeredCount > 0 && (
          <div className="flex items-center px-2.5 py-1 rounded border bg-blue-100 text-blue-700 border-blue-200 shadow-sm whitespace-nowrap">
            <UserCheck className="w-3.5 h-3.5 mr-1.5" />
            <b>{registeredCount}</b> Terdaftar
          </div>
        )}

        {/* 4. DUPLIKAT FILE (Kuning - Clickable) */}
        {duplicateCount > 0 && (
          <button
            onClick={onScrollDuplicate}
            className="flex items-center px-2.5 py-1 rounded border border-yellow-300 bg-yellow-100 text-yellow-800 shadow-sm hover:bg-yellow-200 transition-colors cursor-pointer whitespace-nowrap"
            title="Klik untuk melihat data duplikat excel"
          >
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            <b>{duplicateCount}</b> Duplikat
          </button>
        )}

        {/* 5. INVALID LAINNYA (Merah - NPSN Salah, NIK Salah, dll) */}
        {errorCount > 0 && (
        <button
            onClick={onScrollInvalid}
            className="flex items-center px-2.5 py-1 rounded border border-red-200 bg-red-50 text-red-700 shadow-sm hover:bg-red-100 transition-colors cursor-pointer whitespace-nowrap"
            title="Lihat data error / tidak valid"
          >
            <XCircle className="w-3.5 h-3.5 mr-1.5" />
            <b>{errorCount}</b> Error
          </button>
        )}

      </div>

      {/* TOMBOL RESET */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0 self-end sm:self-auto px-3"
        onClick={onReset}
      >
        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Reset Tabel
      </Button>
    </div>
  );
}