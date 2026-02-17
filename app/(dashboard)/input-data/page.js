"use client";

import { useEffect, useState } from "react";
import DiklatCard from "@/components/input-data/DiklatCard/DiklatCard";
import { useDiklat } from "@/components/diklat/hooks/useDiklat";
import AddDiklatForm from "@/components/input-data/AddDiklatForm";
import InputDataHeader from "@/components/input-data/list/InputDataHeader";
import { DiklatToolbar } from "@/components/diklat//DiklatToolbar";
import FilterDialogDiklat from "@/components/diklat/FilterDialogDiklat";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

export default function InputDataPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // State untuk modal filter jika diperlukan

  const { 
    data, 
    totalData,
    loading, 
    search, 
    setSearch, 
    page, 
    setPage, 
    limit, 
    setLimit,
    activeFilters, // Objek filter aktif dari hook
    setActiveFilters, // Fungsi untuk mengubah filter aktif
    fetchData 
  } = useDiklat();

  const activeCount = Object.entries(activeFilters || {}).reduce((count, [key, value]) => {
    const systemParams = ['page', 'limit', 'search', 'q'];
    if (systemParams.includes(key)) return count;
    if (key === 'end_date') return count;
    const hasValue = value !== "" && value !== null && value !== undefined && 
                    (Array.isArray(value) ? value.length > 0 : true);
    return hasValue ? count + 1 : count;
  }, 0);

  useEffect(() => {
    setPage(1);
  }, [search, setPage]);

  if (isAdding) {
    return (
      <AddDiklatForm
        onBack={() => setIsAdding(false)}
        onSuccess={() => { 
          setIsAdding(false); 
          fetchData(); 
        }}
      />
    );
  }

  return (
    <div className="space-y-6 relative p-1">
      {/* Header Utama */}
      <InputDataHeader onAdd={() => setIsAdding(true)} />
      
      {/* Toolbar Baru */}
      <DiklatToolbar 
        search={search}
        onSearchChange={setSearch}
        activeCount={activeCount}
        onFilterClick={() => setIsFilterOpen(true)}
      />

      {/* List Kartu Diklat */}
      <div className="space-y-4 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
               <div key={i} className="h-32 w-full animate-pulse bg-slate-100 rounded-xl border border-slate-200" />
            ))}
          </div>
        ) : data.length > 0 ? (
          data.map((item) => (
            <DiklatCard
              key={item.id}
              data={item}
              onRefresh={fetchData}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-2xl bg-slate-50/50 text-slate-500">
             <p className="text-sm font-medium">Tidak ada data diklat ditemukan.</p>
             <p className="text-xs">Coba ubah kata kunci atau reset filter.</p>
          </div>
        )}
      </div>

      {/* Floating Pagination Container */}
      {!loading && data.length > 0 && (
        <div className="fixed bottom-1 left-1/2 -translate-x-1/2 z-40 w-full max-w-fit px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-2">
            <DataTablePagination 
              className="border-none p-0"
              page={page}
              limit={limit}
              totalData={totalData || 0}
              setPage={setPage}
              setLimit={(l) => { setLimit(l); setPage(1); }}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Spacer agar card paling bawah tidak tertutup oleh pagination yang melayang */}
      <div className="h-20" />

      {/* TODO: Tambahkan Sheet/Modal Filter di sini jika setIsFilterOpen dipicu */}
      <FilterDialogDiklat 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(f) => { setActiveFilters(f); setPage(1); }}
      />
    </div>
  );
}