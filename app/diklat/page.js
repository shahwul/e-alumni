"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table"; 
import { columns } from "@/components/diklat/columns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react"; // Import icon Filter
import { PesertaDialog } from "@/components/diklat/PesertaDialog";
import FilterDialogDiklat from "@/components/diklat/FilterDialogDiklat"; // Import Dialog Filter

export default function DataDiklatPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Filter
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    startDate: "",
    endDate: "",
    rumpun: "",
    sub_rumpun: "",
    moda: [],
    kategori: [],
    program: [],
    jenjang: [],
    jabatan: []
  });

  // State Dialog Peserta
  const [selectedDiklat, setSelectedDiklat] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        
        // Parameter Dasar
        params.append("search", search);
        params.append("limit", "50");

        // Parameter dari Filter Dialog
        if (activeFilters.startDate) params.append("start_date", activeFilters.startDate);
        if (activeFilters.endDate) params.append("end_date", activeFilters.endDate);
        if (activeFilters.rumpun) params.append("rumpun", activeFilters.rumpun);
        if (activeFilters.sub_rumpun) params.append("sub_rumpun", activeFilters.sub_rumpun);

        // Array Filters (gabung dengan koma)
        if (activeFilters.moda.length > 0) params.append("moda", activeFilters.moda.join(","));
        if (activeFilters.kategori.length > 0) params.append("kategori", activeFilters.kategori.join(","));
        if (activeFilters.program.length > 0) params.append("program", activeFilters.program.join(","));
        if (activeFilters.jenjang.length > 0) params.append("jenjang", activeFilters.jenjang.join(","));
        if (activeFilters.jabatan.length > 0) params.append("jabatan", activeFilters.jabatan.join(","));

        const res = await fetch(`/api/diklat?${params.toString()}`);
        const result = await res.json();
        setData(result.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 500);
    return () => clearTimeout(timer);
  }, [search, activeFilters]); // Re-fetch saat search atau filter berubah

  // Handler Buka Dialog Peserta
  const handleViewPeserta = (diklat) => {
    setSelectedDiklat(diklat);
    setOpenDialog(true);
  };

  // Handler Apply Filter dari Dialog
  const handleApplyFilter = (newFilters) => {
    setActiveFilters(newFilters);
  };

  // Hitung jumlah filter aktif untuk badge
  const activeCount = [
    activeFilters.startDate, activeFilters.endDate, activeFilters.rumpun, activeFilters.sub_rumpun,
    ...activeFilters.moda, ...activeFilters.kategori, ...activeFilters.program, 
    ...activeFilters.jenjang, ...activeFilters.jabatan
  ].filter(Boolean).length;

  return (
    <div className="space-y-6 p-1">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Katalog Diklat</h2>
        <p className="text-slate-500 text-sm mt-1">Daftar pelatihan yang telah dan sedang dilaksanakan.</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Cari judul diklat..." 
            className="pl-10" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2 border-dashed"
              onClick={() => setIsFilterOpen(true)}
            >
              <Filter size={16} /> Filter
              {activeCount > 0 && (
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                  {activeCount}
                </span>
              )}
            </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
         {loading ? (
             <div className="p-8 text-center text-slate-500">Memuat data diklat...</div>
         ) : (
             <DataTable 
                columns={columns(handleViewPeserta)} 
                data={data} 
             />
         )}
      </div>

      {/* Dialog Filter */}
      <FilterDialogDiklat 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleApplyFilter}
      />

      {/* Dialog Peserta */}
      <PesertaDialog 
        open={openDialog} 
        onOpenChange={setOpenDialog} 
        diklatId={selectedDiklat?.id}
        judulDiklat={selectedDiklat?.title}
      />

    </div>
  );
}