"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PTKHeader } from "@/components/ptk/list/PTKHeader";
import { PTKToolbar } from "@/components/ptk/list/PTKToolbar";
import { PTKTable } from "@/components/ptk/list/PTKTable";
import { PTKPagination } from "@/components/ptk/list/PTKPagination";
import { usePTKList } from "@/components/ptk/list/usePTKList";
import { AddToDiklatModal } from "@/components/ptk/AddToDiklatModal";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function DataPTKPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    data, loading, totalData,
    page, limit, search, sorting, activeFilters, 
    onExport,
  } = usePTKList(searchParams);

  const updateURL = (updates) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (key === "kabupaten" || key === "kecamatan" || key === "sekolah" || key === "judul_diklat") {
         params.delete(key);
         if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
         }
      } 
      else if (key === "dateRange") {
         params.delete("date_from");
         params.delete("date_to");
         if (value?.from) params.set("date_from", value.from.toISOString());
         if (value?.to) params.set("date_to", value.to.toISOString());
      } 
      else if (key === "sorting") {
         if (value && value[0]) {
            params.set("sort", `${value[0].id}:${value[0].desc ? 'desc' : 'asc'}`);
         }
      }
      else {
         if (value) params.set(key, value);
         else params.delete(key);
      }
    });

    if (!updates.hasOwnProperty("page")) {
        params.set("page", "1");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  
  const setPage = (newPage) => updateURL({ page: newPage });
  const setLimit = (newLimit) => updateURL({ limit: newLimit, page: 1 }); // Reset ke halaman 1 saat limit berubah
  const setSearch = (newSearch) => updateURL({ search: newSearch });
  const setSorting = (newSort) => updateURL({ sorting: newSort });
  
  const setActiveFilters = (newFilters) => {
      const resolvedFilters = typeof newFilters === 'function' ? newFilters(activeFilters) : newFilters;
      
      updateURL(resolvedFilters);
  };

  const [rowSelection, setRowSelection] = useState({});
  const [isAddToDiklatOpen, setIsAddToDiklatOpen] = useState(false);
  const isCandidateMode = activeFilters.mode_filter === "eligible";

  useEffect(() => {
    setRowSelection({});
  }, [isCandidateMode]);
  
  const selectedNiks = Object.keys(rowSelection);

  return (
    <div className="space-y-6 relative p-1"> 
      
      <PTKHeader onExport={onExport} />
      
      <PTKToolbar
        search={search}
        setSearch={setSearch}
        sorting={sorting}
        setSorting={setSorting}
        onApplyFilter={setActiveFilters}
        activeFilters={activeFilters}
      />

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">
        <PTKTable 
            data={data} 
            loading={loading}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection} 
            isCandidateMode={isCandidateMode}
            enableRowClick={isCandidateMode}
            sorting={sorting} 
            setSorting={setSorting}
        />
        
        <PTKPagination
          page={page}
          limit={limit}
          totalData={totalData}
          setPage={setPage}
          setLimit={setLimit}
        />
      </div>

      {/* Floating Action Bar */}
      {selectedNiks.length > 0 && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-4 border border-slate-700">
           <div className="flex flex-col">
             <span className="text-sm font-bold">{selectedNiks.length} PTK Dipilih</span>
             <span className="text-[10px] text-slate-400">Siap diproses</span>
           </div>
           <div className="h-8 w-[1px] bg-slate-700 mx-2"></div>
           <Button 
             size="sm" 
             className="bg-blue-600 hover:bg-blue-500 text-white border-0"
             onClick={() => setIsAddToDiklatOpen(true)}
           >
             + Masukkan ke Kandidat
           </Button>
           <Button 
             size="icon" 
             variant="ghost" 
             className="h-8 w-8 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white" 
             onClick={() => setRowSelection({})}
           >
             <X size={16} />
           </Button>
        </div>
      )}

      <AddToDiklatModal 
        isOpen={isAddToDiklatOpen}
        selectedNiks={selectedNiks}
        onClose={() => setIsAddToDiklatOpen(false)}
        onSuccess={() => setRowSelection({})} 
      />
    </div>
  );
}