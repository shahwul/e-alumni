"use client";

import { useFilterContext } from "../FilterContext";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function ModeSwitcher() {
  const { filters } = useFilterContext();
  const isCandidateMode = (filters.mode_filter || 'eligible') === 'eligible';
  const formatDate = (date) => date ? format(date, "dd MMM yyyy", { locale: id }) : "...";

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
          <span className="h-4 w-1 bg-purple-500 rounded-full"></span> 
          Filter Diklat
        </h4>
      </div>

      {/* Info Box */}
      <div
        className={cn(
          "p-3 rounded-md text-xs border flex items-start gap-2 transition-colors duration-300",
          isCandidateMode
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-blue-50 border-blue-200 text-blue-800"
        )}
      >
        <Info size={16} className="shrink-0 mt-0.5" />
        
        {/* LOGIC TAMPILAN TEXT */}
        {isCandidateMode ? (
          <div>
            <p className="font-bold mb-1 uppercase tracking-wide">Mode Kandidat (Eligible)</p>
            
            {/* Jika Ada Tanggal Dipilih */}
            {filters.dateRange?.from ? (
              <>
                <p>
                  Mencari guru yang <b>BELUM LULUS</b> diklat pada periode: <br/>
                  <span className="font-mono font-semibold bg-white/50 px-1 rounded">
                    {formatDate(filters.dateRange.from)} - {formatDate(filters.dateRange.to)}
                  </span>
                </p>
                <p className="mt-1.5 italic opacity-80 border-l-2 border-green-300 pl-2">
                  Catatan: Guru yang pernah lulus <b>di luar</b> tanggal ini akan tetap dianggap kandidat (Eligible).
                </p>
              </>
            ) : (
              /* Jika Tidak Ada Tanggal */
              <p>
                Mencari guru yang <b>BELUM PERNAH</b> lulus diklat terpilih (Seumur Hidup / Belum ada riwayat sama sekali).
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="font-bold mb-1 uppercase tracking-wide">Mode Riwayat</p>
            
            {/* Jika Ada Tanggal Dipilih */}
            {filters.dateRange?.from ? (
              <p>
                Mencari guru yang <b>SUDAH LULUS</b> diklat pada periode: <br/>
                <span className="font-mono font-semibold bg-white/50 px-1 rounded">
                   {formatDate(filters.dateRange.from)} - {formatDate(filters.dateRange.to)}
                </span>
              </p>
            ) : (
              /* Jika Tidak Ada Tanggal */
              <p>
                Mencari guru yang <b>SUDAH LULUS</b> diklat terpilih (Semua Waktu).
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}