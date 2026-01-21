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
import { FilterDialog } from "@/components/ptk/FilterDialog"; // Import Dialog Baru
import { format } from "date-fns";

export default function DataPTKPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE UTAMA ---
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState("nama_asc"); // Default Sort: Nama A-Z
  
  // State Filter (Object biar rapi)
  const [activeFilters, setActiveFilters] = useState({
    kabupaten: "",
    kecamatan: "",
    jenjang: "",
    status: "",
    sekolah: ""
  });

  // --- FETCH DATA ---
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        
        // 1. Params Search
        if (search) params.append("search", search);
        
        // 2. Params Filter dari Dialog
        if (activeFilters.kabupaten) params.append("kabupaten", activeFilters.kabupaten);
        if (activeFilters.kecamatan) params.append("kecamatan", activeFilters.kecamatan);
        if (activeFilters.jenjang) params.append("jenjang", activeFilters.jenjang);
        if (activeFilters.status) params.append("status", activeFilters.status);
        if (activeFilters.sekolah) params.append("sekolah", activeFilters.sekolah);
        if (activeFilters.judul_diklat) params.append("judul_diklat", activeFilters.judul_diklat);
        if (activeFilters.rumpun) params.append("rumpun", activeFilters.rumpun);
        if (activeFilters.dateRange?.from) {
        // Format ke YYYY-MM-DD
        const startDateStr = format(activeFilters.dateRange.from, "yyyy-MM-dd");
        params.append("start_date", startDateStr);
        
        // Cek kalau user cuma pilih 1 tanggal (Start doang), anggap End-nya sama
        // Atau kalau user pilih range lengkap
        const endDateStr = activeFilters.dateRange.to 
            ? format(activeFilters.dateRange.to, "yyyy-MM-dd") 
            : startDateStr;
            
        params.append("end_date", endDateStr);
    }

        // 3. (Opsional) Kirim param sorting ke backend kalau backend support
        // params.append("sort", sorting);

        const res = await fetch(`/api/ptk?${params.toString()}`);
        const result = await res.json();
        
        let fetchedData = result.data || [];

        // --- CLIENT SIDE SORTING (Sementara) ---
        // Karena backend query tadi belum ada 'ORDER BY' dinamis, kita sort di sini aja biar cepet.
        if (sorting === "nama_asc") {
          fetchedData.sort((a, b) => a.nama_ptk.localeCompare(b.nama_ptk));
        } else if (sorting === "nama_desc") {
           fetchedData.sort((a, b) => b.nama_ptk.localeCompare(a.nama_ptk));
        } else if (sorting === "sekolah_asc") {
           fetchedData.sort((a, b) => a.nama_sekolah.localeCompare(b.nama_sekolah));
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
  }, [search, activeFilters, sorting]); // Fetch ulang kalau filter/sort berubah

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
           <Button variant="outline" className="gap-2">
            <Download size={16} />
            Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            + Tambah PTK
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        
        {/* KIRI: Sorting Dropdown */}
        <div className="w-full md:w-[200px]">
          <Select value={sorting} onValueChange={setSorting}>
            <SelectTrigger>
              <SelectValue placeholder="Urutkan..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nama_asc">Nama (A-Z)</SelectItem>
              <SelectItem value="nama_desc">Nama (Z-A)</SelectItem>
              <SelectItem value="sekolah_asc">Sekolah (A-Z)</SelectItem>
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

        {/* KANAN: Filter Dialog (Popup) */}
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