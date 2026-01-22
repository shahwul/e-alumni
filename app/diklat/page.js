"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table"; // Pakai component DataTable yang sama dgn PTK
import { columns } from "@/components/diklat/columns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { PesertaDialog } from "@/components/diklat/PesertaDialog";

export default function DataDiklatPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // State Dialog Peserta
  const [selectedDiklat, setSelectedDiklat] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/diklat?search=${search}&limit=50`); // Limit gedein aja biar enak scroll
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
  }, [search]);

  // Handler Buka Dialog
  const handleViewPeserta = (diklat) => {
    setSelectedDiklat(diklat);
    setOpenDialog(true);
  };

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
            {/* Bisa tambah filter tahun/topik disini nanti */}
            <Button variant="outline">Filter</Button>
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