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
import { Search, Download } from "lucide-react";
import { FilterDialog } from "@/components/ptk/FilterDialog"; 
import { format } from "date-fns";

export default function DataPTKPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE UTAMA ---
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState("nama_asc"); 
  
  const [activeFilters, setActiveFilters] = useState({
    kabupaten: [],
    kecamatan: [],
    jenjang: "",
    status: "",
    sekolah: "",
    judul_diklat: "",
    rumpun: "",
    sub_rumpun: "",
    mode_filter: "history",
    dateRange: { from: undefined, to: undefined }
  });

  // --- FETCH DATA ---
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        
        // 1. Params Search
        if (search) params.append("search", search);
        
        // 2. Params Filter
        if (activeFilters.kabupaten.length > 0) params.append("kabupaten", activeFilters.kabupaten.join(","));
        if (activeFilters.kecamatan.length > 0) params.append("kecamatan", activeFilters.kecamatan.join(","));
        if (activeFilters.jenjang) params.append("jenjang", activeFilters.jenjang);
        if (activeFilters.status) params.append("status", activeFilters.status);
        if (activeFilters.sekolah) params.append("sekolah", activeFilters.sekolah);
        if (activeFilters.judul_diklat) params.append("judul_diklat", activeFilters.judul_diklat);
        if (activeFilters.rumpun && activeFilters.rumpun !== "ALL") params.append("rumpun", activeFilters.rumpun);
        if (activeFilters.sub_rumpun && activeFilters.sub_rumpun !== "ALL") params.append("sub_rumpun", activeFilters.sub_rumpun);
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

        const res = await fetch(`/api/ptk?${params.toString()}`);
        const result = await res.json();
        
        let fetchedData = result.data || [];

        // --- CLIENT SIDE SORTING ---
        if (sorting === "nama_asc") {
          fetchedData.sort((a, b) => a.nama_ptk.localeCompare(b.nama_ptk));
        } else if (sorting === "nama_desc") {
           fetchedData.sort((a, b) => b.nama_ptk.localeCompare(a.nama_ptk));
        } else if (sorting === "sekolah_asc") {
           fetchedData.sort((a, b) => a.nama_sekolah.localeCompare(b.nama_sekolah));
        
        // Sorting Status Kepegawaian (PNS, GTY, dll)
        } else if (sorting === "status_asc") {
           fetchedData.sort((a, b) => (a.status_kepegawaian || "").localeCompare(b.status_kepegawaian || ""));
        } else if (sorting === "status_desc") {
           fetchedData.sort((a, b) => (b.status_kepegawaian || "").localeCompare(a.status_kepegawaian || ""));
        
        // === BARU: Sorting Status Pelatihan (Sudah/Belum) ===
        } else if (sorting === "pelatihan_sudah") {
           // Yang SUDAH (true) di atas
           fetchedData.sort((a, b) => (b.is_sudah_pelatihan === true ? 1 : 0) - (a.is_sudah_pelatihan === true ? 1 : 0));
        } else if (sorting === "pelatihan_belum") {
           // Yang BELUM (false) di atas
           fetchedData.sort((a, b) => (a.is_sudah_pelatihan === true ? 1 : 0) - (b.is_sudah_pelatihan === true ? 1 : 0));
        }

        setData(fetchedData);
      } catch (error) {
        console.error("Gagal ambil data", error);
      } finally {
        setLoading(false);
      }
    }
    const timeout = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, activeFilters, sorting]);

   const handleExport = () => {
    // 1. Siapkan wadah parameter URL
    const params = new URLSearchParams();
    
    // 2. Masukkan parameter Search (kalau ada isinya)
    if (search) params.append("search", search);
    
    // 3. Masukkan parameter Filter Wilayah (Array -> Comma Separated)
    if (activeFilters.kabupaten.length > 0) {
        params.append("kabupaten", activeFilters.kabupaten.join(","));
    }
    if (activeFilters.kecamatan.length > 0) {
        params.append("kecamatan", activeFilters.kecamatan.join(","));
    }
    
    // 4. Masukkan Filter Dropdown (Jenjang, Status, Sekolah)
    if (activeFilters.jenjang) params.append("jenjang", activeFilters.jenjang);
    if (activeFilters.status) params.append("status", activeFilters.status);
    if (activeFilters.sekolah) params.append("sekolah", activeFilters.sekolah);
    
    // Handle Array Judul Diklat (Join pakai separator aman '||')
    if (activeFilters.judul_diklat && activeFilters.judul_diklat.length > 0) {
        params.append("judul_diklat", activeFilters.judul_diklat.join("||"));
    }
    
    // Kirim Mode Filter
    if (activeFilters.mode_filter) {
        params.append("mode_filter", activeFilters.mode_filter);
    }

    if (activeFilters.rumpun && activeFilters.rumpun !== "ALL") {
        params.append("rumpun", activeFilters.rumpun);
    }
    if (activeFilters.sub_rumpun && activeFilters.sub_rumpun !== "ALL") {
        params.append("sub_rumpun", activeFilters.sub_rumpun);
    }
    
    // 6. Masukkan Filter Tanggal (Format dulu ke YYYY-MM-DD)
    if (activeFilters.dateRange?.from) {
      const startDateStr = format(activeFilters.dateRange.from, "yyyy-MM-dd");
      params.append("start_date", startDateStr);
      
      // Kalau user cuma pilih start date (1 hari), end date disamakan
      const endDateStr = activeFilters.dateRange.to 
          ? format(activeFilters.dateRange.to, "yyyy-MM-dd") 
          : startDateStr;
          
      params.append("end_date", endDateStr);
    }

    // 7. Redirect Browser ke URL API (Trigger Download)
    // Browser akan otomatis download file .xlsx karena header API-nya attachment
    window.location.href = `/api/ptk/export?${params.toString()}`;
  };


  return (
    <div className="space-y-6 p-1">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Data Pendidik & Tenaga Kependidikan
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Kelola data guru, pantau status pelatihan, dan riwayat diklat.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download size={16} /> Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            + Tambah PTK
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        
        {/* KIRI: Sorting Dropdown */}
        <div className="w-full md:w-[240px]">
          <Select value={sorting} onValueChange={setSorting}>
            <SelectTrigger>
              <SelectValue placeholder="Urutkan..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nama_asc">Nama (A-Z)</SelectItem>
              <SelectItem value="nama_desc">Nama (Z-A)</SelectItem>
              <SelectItem value="sekolah_asc">Sekolah (A-Z)</SelectItem>
              
              <SelectItem value="status_asc">Status Kepegawaian (A-Z)</SelectItem>
              
              {/* === MENU SORTING BARU === */}
              <SelectItem value="pelatihan_sudah">Pelatihan (Sudah - Belum)</SelectItem>
              <SelectItem value="pelatihan_belum">Pelatihan (Belum - Sudah)</SelectItem>
              
            </SelectContent>
          </Select>
        </div>

        {/* TENGAH: Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Cari berdasarkan NIK atau Nama PTK..." 
            className="pl-10 border-slate-200 focus-visible:ring-blue-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* KANAN: Filter Dialog */}
        <FilterDialog onApplyFilter={setActiveFilters} />
      </div>

      {/* Tabel */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
            <div className="p-8 text-center text-slate-500">Memuat data...</div>
        ) : (
            <DataTable columns={columns} data={data} />
        )}
      </div>

    </div>
  );
}