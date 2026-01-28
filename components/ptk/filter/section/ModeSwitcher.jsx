"use client";
import { useFilterContext } from "../FilterContext";
// UI Components
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function ModeSwitcher() {
  const { filters, setFilters } = useFilterContext();

  return (
    <>
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
          <span className="h-4 w-1 bg-purple-500 rounded-full"></span> Filter
          Diklat
        </h4>

        {/* SWITCH MODE FILTER */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setFilters({ ...filters, mode_filter: "history" })}
            className={cn(
              "text-[10px] px-3 py-1.5 rounded-md transition-all font-medium",
              filters.mode_filter === "history"
                ? "bg-white shadow text-blue-700"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            Riwayat
          </button>
          <button
            onClick={() => setFilters({ ...filters, mode_filter: "eligible" })}
            className={cn(
              "text-[10px] px-3 py-1.5 rounded-md transition-all font-medium",
              filters.mode_filter === "eligible"
                ? "bg-white shadow text-green-700"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            Kandidat
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div
        className={cn(
          "p-3 rounded-md text-xs border flex items-start gap-2",
          filters.mode_filter === "eligible"
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-blue-50 border-blue-200 text-blue-800",
        )}
      >
        <Info size={16} className="shrink-0 mt-0.5" />
        {filters.mode_filter === "eligible" ? (
          <div>
            <p className="font-semibold mb-1">Mode Kandidat (Eligible)</p>
            {filters.dateRange?.from ? (
              <p>
                Mencari guru yang <b>BELUM LULUS</b> diklat terpilih dalam
                periode{" "}
                <b>
                  {format(filters.dateRange.from, "dd MMM y", { locale: id })}
                </b>{" "}
                s/d{" "}
                <b>
                  {filters.dateRange.to
                    ? format(filters.dateRange.to, "dd MMM y", { locale: id })
                    : "..."}
                </b>
                .
                <br />
                <span className="italic opacity-80">
                  (Guru yang lulus DILUAR tanggal ini akan tetap muncul /
                  dianggap perlu refresh).
                </span>
              </p>
            ) : (
              <p>
                Mencari guru yang <b>BELUM PERNAH</b> lulus diklat terpilih
                (Seumur Hidup).
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="font-semibold mb-1">Mode Riwayat</p>
            <p>
              Mencari guru yang <b>SUDAH LULUS</b> diklat terpilih.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
