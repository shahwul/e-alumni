"use client";

import { Input } from "@/components/ui/input";
import { Search, UserPlus, History } from "lucide-react"; 
import { FilterDialog } from "@/components/ptk/filter/FilterDialog";
import { cn } from "@/lib/utils"; 

export function PTKToolbar({
  search,
  setSearch,
  onApplyFilter,
  activeFilters = {}, 
}) {
  
  const currentMode = activeFilters.mode_filter || 'eligible';
  const isCandidateMode = currentMode === 'eligible';

  const handleModeChange = (mode) => {
    onApplyFilter({ ...activeFilters, mode_filter: mode });
  };

  return (
    <div className="space-y-3">
      
      {/* --- BAGIAN 1: SWITCHER MODE --- */}
      <div className="grid grid-cols-2 p-1 gap-1 bg-slate-100/80 rounded-xl border border-slate-200">
        <button
          onClick={() => handleModeChange('eligible')}
          className={cn(
            "flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200",
            isCandidateMode
              ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          )}
        >
          <UserPlus size={16} />
          Mode Kandidat (Pilih Peserta)
        </button>

        <button
          onClick={() => handleModeChange('history')}
          className={cn(
            "flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200",
            !isCandidateMode
              ? "bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          )}
        >
          <History size={16} />
          Mode Riwayat / Arsip
        </button>
      </div>

      {/* --- BAGIAN 2: TOOLBAR BERSIH (HANYA SEARCH & FILTER) --- */}
      <div className={cn(
          "bg-white p-4 rounded-xl border shadow-sm flex flex-col md:flex-row gap-4 items-center transition-colors duration-300",
          isCandidateMode ? "border-blue-100 shadow-blue-50" : "border-slate-200"
      )}>
        
        {/* Kolom Search jadi Full Width di mobile, atau flex-1 di desktop */}
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <Input
            placeholder="Cari berdasarkan NIK atau Nama PTK..."
            className="pl-10 border-slate-200 focus-visible:ring-blue-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <FilterDialog onApplyFilter={onApplyFilter} activeFilters={activeFilters} />
      </div>
    </div>
  );
}