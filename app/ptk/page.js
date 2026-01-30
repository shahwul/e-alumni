"use client";

import { useEffect, useState } from "react";
import { columns } from "@/components/ptk/columns";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { FilterDialog } from "@/components/ptk/filter/FilterDialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils"; // Pastikan ini ada (dari shadcn)

export default function DataPTKPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE PAGINATION ---
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25); // Default 25 data biar pas
  const [totalData, setTotalData] = useState(0);

  // --- STATE FILTER UTAMA ---
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState("nama_asc");

  const [activeFilters, setActiveFilters] = useState({
    kabupaten: [],
    kecamatan: [],
    jenjang: "",
    status: "",
    sekolah: "",
    judul_diklat: "",
    kategori: "",
    program: "",
    rumpun: "",
    sub_rumpun: "",
    mode_filter: "history",
    dateRange: { from: undefined, to: undefined },
  });

  // Reset page ke 1 kalau filter berubah
  useEffect(() => {
    setPage(1);
  }, [search, activeFilters, sorting]);

  // --- FETCH DATA ---
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        // 1. Pagination
        params.append("page", page);
        params.append("limit", limit);

        // 2. Search
        if (search) params.append("search", search);

        // 3. Filters
        if (activeFilters.kabupaten.length > 0)
          params.append("kabupaten", activeFilters.kabupaten.join(","));
        if (activeFilters.kecamatan.length > 0)
          params.append("kecamatan", activeFilters.kecamatan.join(","));
        if (activeFilters.jenjang)
          params.append("jenjang", activeFilters.jenjang);
        if (activeFilters.status) params.append("status", activeFilters.status);
        if (activeFilters.sekolah)
          params.append("sekolah", activeFilters.sekolah);
        if (activeFilters.judul_diklat)
          params.append("judul_diklat", activeFilters.judul_diklat);

        if (activeFilters.kategori)
          params.append("kategori", activeFilters.kategori);
        if (activeFilters.program)
          params.append("program", activeFilters.program);

        if (activeFilters.rumpun && activeFilters.rumpun !== "ALL")
          params.append("rumpun", activeFilters.rumpun);
        if (activeFilters.sub_rumpun && activeFilters.sub_rumpun !== "ALL")
          params.append("sub_rumpun", activeFilters.sub_rumpun);
        if (activeFilters.mode_filter) {
          params.append("mode_filter", activeFilters.mode_filter);
        }

        if (activeFilters.dateRange?.from) {
          const startDateStr = format(activeFilters.dateRange.from, "yyyy-MM-dd");
          params.append("start_date", startDateStr);
          const endDateStr = activeFilters.dateRange.to
            ? format(activeFilters.dateRange.to, "yyyy-MM-dd")
            : startDateStr;
          params.append("end_date", endDateStr);
        }

        // 4. Client Sorting Params (Kirim ke backend biar di sort disana lebih efisien)
        // Kita kirim 'sort_by' dan 'sort_order'
        const [sortBy, sortOrder] = sorting.includes("_") 
            ? sorting.split("_") 
            : ["nama", "asc"]; // Default fallback
        
        // Mapping nama sorting frontend ke kolom backend
        let dbSortColumn = "nama_ptk";
        if(sortBy === "sekolah") dbSortColumn = "nama_sekolah";
        if(sortBy === "status") dbSortColumn = "status_kepegawaian";
        // Untuk 'pelatihan', logic sortingnya agak beda, bisa dihandle backend nanti
        
        params.append("sort_by", sortBy);
        params.append("sort_order", sortOrder);

        const res = await fetch(`/api/ptk?${params.toString()}`);
        const result = await res.json();

        setData(result.data || []);
        setTotalData(result.meta?.totalData || 0);

      } catch (error) {
        console.error("Gagal ambil data", error);
      } finally {
        setLoading(false);
      }
    }

    const timeout = setTimeout(() => {
      fetchData();
    }, 400); // Debounce sedikit lebih cepat

    return () => clearTimeout(timeout);
  }, [search, activeFilters, sorting, page, limit]); // Tambah dependency page & limit

  const handleExport = () => {
    // Logic export sama, copy paste dari kodemu sebelumnya
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (activeFilters.kabupaten.length > 0) params.append("kabupaten", activeFilters.kabupaten.join(","));
    if (activeFilters.kecamatan.length > 0) params.append("kecamatan", activeFilters.kecamatan.join(","));
    if (activeFilters.jenjang) params.append("jenjang", activeFilters.jenjang);
    if (activeFilters.status) params.append("status", activeFilters.status);
    if (activeFilters.sekolah) params.append("sekolah", activeFilters.sekolah);
    if (activeFilters.judul_diklat && activeFilters.judul_diklat.length > 0) params.append("judul_diklat", activeFilters.judul_diklat.join("||"));
    if (activeFilters.mode_filter) params.append("mode_filter", activeFilters.mode_filter);
    if (activeFilters.rumpun && activeFilters.rumpun !== "ALL") params.append("rumpun", activeFilters.rumpun);
    if (activeFilters.sub_rumpun && activeFilters.sub_rumpun !== "ALL") params.append("sub_rumpun", activeFilters.sub_rumpun);
    if (activeFilters.dateRange?.from) {
      const startDateStr = format(activeFilters.dateRange.from, "yyyy-MM-dd");
      params.append("start_date", startDateStr);
      const endDateStr = activeFilters.dateRange.to ? format(activeFilters.dateRange.to, "yyyy-MM-dd") : startDateStr;
      params.append("end_date", endDateStr);
    }
    window.location.href = `/api/ptk/export?${params.toString()}`;
  };

  const startEntry = (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, totalData);
  const totalPage = Math.ceil(totalData / limit);

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Data Pendidik & Tenaga Kependidikan</h2>
          <p className="text-slate-500 text-sm mt-1">Kelola data guru, pantau status pelatihan, dan riwayat diklat.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport}><Download size={16} /> Export</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">+ Tambah PTK</Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:w-[240px]">
          <Select value={sorting} onValueChange={setSorting}>
            <SelectTrigger><SelectValue placeholder="Urutkan..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="nama_asc">Nama (A-Z)</SelectItem>
              <SelectItem value="nama_desc">Nama (Z-A)</SelectItem>
              <SelectItem value="sekolah_asc">Sekolah (A-Z)</SelectItem>
              <SelectItem value="status_asc">Status Kepegawaian (A-Z)</SelectItem>
              <SelectItem value="pelatihan_sudah">Pelatihan (Sudah - Belum)</SelectItem>
              <SelectItem value="pelatihan_belum">Pelatihan (Belum - Sudah)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input placeholder="Cari berdasarkan NIK atau Nama PTK..." className="pl-10 border-slate-200 focus-visible:ring-blue-600" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <FilterDialog onApplyFilter={setActiveFilters} />
      </div>
      
      {/* TABLE CONTAINER */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">
        
        {/* 1. SCROLLABLE AREA */}
        <div className="relative max-h-[60vh] w-full overflow-auto">
          {loading ? (
             // Skeleton Loader Sederhana
             <div className="p-8 space-y-4">
                {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-slate-50 animate-pulse rounded-md w-full" />)}
             </div>
          ) : (
             <DataTable columns={columns} data={data} />
          )}
        </div>

        {/* 2. PAGINATION FOOTER */}
        <div className="border-t border-slate-100 bg-slate-50 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <div className="text-slate-500">
                Menampilkan <span className="font-medium text-slate-900">{totalData > 0 ? startEntry : 0}</span> - <span className="font-medium text-slate-900">{endEntry}</span> dari <span className="font-medium text-slate-900">{totalData}</span> data
            </div>
            
            <div className="flex items-center gap-2">
                <div className="flex items-center mr-4">
                    <span className="text-slate-500 mr-2">Baris:</span>
                    <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
                        <SelectTrigger className="h-8 w-[70px] bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button 
                    variant="outline" size="sm" className="h-8 w-8 p-0"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="min-w-[80px] text-center font-medium">
                    Hal {page} / {totalPage || 1}
                </span>

                <Button 
                    variant="outline" size="sm" className="h-8 w-8 p-0"
                    onClick={() => setPage(p => Math.min(totalPage, p + 1))}
                    disabled={page >= totalPage || loading}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}