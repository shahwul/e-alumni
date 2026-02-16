"use client";

import { useState, useEffect } from "react"; // Tambah useEffect
import { Input } from "@/components/ui/input";
import { Search, UserPlus, History } from "lucide-react"; 
import { FilterDialog } from "@/components/ptk/filter/FilterDialog";
import { cn } from "@/lib/utils"; 

const countActiveFilters = (filters) => {
  if (!filters) return 0;
  
  let count = 0;
  Object.entries(filters).forEach(([key, value]) => {
    if (!value) return;
    if (key === "mode_filter") return; 

    if (Array.isArray(value)) {
      if (value.length > 0) count++;
    } 
    else if (key === "dateRange") {
      if (value.from || value.to) count++;
    } 
    else if (typeof value === "string" && value.trim() !== "") {
      count++;
    }
  });
  return count;
};

export function PTKToolbar({
  search,
  setSearch,
  onApplyFilter,
  activeFilters = {}, 
}) {
  const [localSearch, setLocalSearch] = useState(search);

  const currentMode = activeFilters.mode_filter || 'eligible';
  const isCandidateMode = currentMode === 'eligible';
  const filterCount = countActiveFilters(activeFilters);

  useEffect(() => {
    if (localSearch === search) return;

    const timer = setTimeout(() => {
      setSearch(localSearch);
    }, 500); 

    return () => clearTimeout(timer);
  }, [localSearch, setSearch, search]);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const handleModeChange = (mode) => {
    onApplyFilter({ ...activeFilters, mode_filter: mode });
  };

  return (
    <div className="space-y-3">
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

      <div className={cn(
          "bg-white p-4 rounded-xl border shadow-sm flex flex-col md:flex-row gap-4 items-center transition-colors duration-300",
          isCandidateMode ? "border-blue-100 shadow-blue-50" : "border-slate-200"
      )}>
        
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <Input
            placeholder="Cari berdasarkan NIK atau Nama PTK..."
            className="pl-10 border-slate-200 focus-visible:ring-blue-600"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          {localSearch !== search && (
             <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             </div>
          )}
        </div>

        <FilterDialog 
            onApplyFilter={onApplyFilter} 
            activeFilters={activeFilters} 
            filterCount={filterCount} 
        />
      </div>
    </div>
  );
}