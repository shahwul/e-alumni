"use client";

import { useState } from "react";
import { useEffect } from "react";
import { PTKHeader } from "@/components/ptk/list/PTKHeader";
import { PTKToolbar } from "@/components/ptk/list/PTKToolbar";
import { PTKTable } from "@/components/ptk/list/PTKTable";
import { PTKPagination } from "@/components/ptk/list/PTKPagination";
import { usePTKList } from "@/components/ptk/list/usePTKList";

// --- IMPORT TAMBAHAN ---
import { AddToDiklatModal } from "@/components/ptk/AddToDiklatModal";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function DataPTKPage() {
  // 1. Hook Data Utama
  const {
    data,
    loading,
    page,
    limit,
    totalData,
    search,
    sorting,
    activeFilters,

    setPage,
    setLimit,
    setSearch,
    setSorting,
    setActiveFilters,

    onExport,
  } = usePTKList();

  // 2. State Baru untuk Seleksi (Checklist)
  const [rowSelection, setRowSelection] = useState({});
  const [isAddToDiklatOpen, setIsAddToDiklatOpen] = useState(false);
  const isCandidateMode = activeFilters.mode_filter === "eligible"; // Cek mode kandidat untuk menyesuaikan tampilan jika diperlukan

  useEffect(() => {
    setRowSelection({});
  }, [isCandidateMode]);
  // Helper: Ambil NIK yang dipilih
  const selectedNiks = Object.keys(rowSelection);

  console.log("Sorting State:", sorting);

  return (
    // Tambah 'relative' & 'p-1' agar floating bar posisinya pas
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
        
        {/* Update PTKTable: Kirim props rowSelection */}
        <PTKTable 
            data={data} 
            loading={loading}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection} 
            isCandidateMode={isCandidateMode} // Kirim info mode kandidat
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

      {/* 3. Floating Action Bar (Muncul saat ada seleksi) */}
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

      {/* 4. Modal Picker Diklat */}
      <AddToDiklatModal 
        isOpen={isAddToDiklatOpen}
        selectedNiks={selectedNiks}
        onClose={() => setIsAddToDiklatOpen(false)}
        onSuccess={() => setRowSelection({})} // Reset checklist jika berhasil simpan
      />

    </div>
  );
}