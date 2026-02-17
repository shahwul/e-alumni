"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table"; 
import { columns } from "@/components/diklat/columns";
import { useDiklat } from "@/components/diklat/hooks/useDiklat";
import { PesertaDialog } from "@/components/diklat/PesertaDialog";
import { PTKPagination } from "@/components/ptk/list/PTKPagination";
import { DiklatToolbar } from "@/components/diklat/DiklatToolbar";
import FilterDialogDiklat from "@/components/diklat/FilterDialogDiklat";

export default function DataDiklatPage() {
  const { 
    data, totalData, loading, search, setSearch, 
    page, setPage, limit, setLimit, 
    activeFilters, setActiveFilters, sorting, setSorting
  } = useDiklat();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedDiklat, setSelectedDiklat] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const activeCount = Object.values(activeFilters).flat().filter(Boolean).length;

  return (
    <div className="space-y-6 p-1">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Katalog Diklat</h2>
        <p className="text-slate-500 text-sm mt-1">Daftar pelatihan yang telah dilaksanakan.</p>
      </div>

      <DiklatToolbar 
        search={search} 
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        onFilterClick={() => setIsFilterOpen(true)}
        activeCount={activeCount}
      />

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <DataTable 
          columns={columns((d) => { setSelectedDiklat(d); setOpenDialog(true); })} 
          data={data} 
          loading={loading}
          sorting={sorting}
          onSortingChange={setSorting}
        />
        <PTKPagination 
          page={page}
          limit={limit}
          totalData={totalData}
          setPage={setPage}
          setLimit={(l) => { setLimit(l); setPage(1); }}
          loading={loading}
        />
      </div>

      <FilterDialogDiklat 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(f) => { setActiveFilters(f); setPage(1); }}
      />

      <PesertaDialog 
        open={openDialog} 
        onOpenChange={setOpenDialog} 
        diklatId={selectedDiklat?.id}
        judulDiklat={selectedDiklat?.title}
      />
    </div>
  );
}