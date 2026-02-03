"use client";

import { useEffect, useState } from "react";
import DiklatCard from "@/components/input-data/DiklatCard/DiklatCard";
import AddDiklatForm from "@/components/input-data/AddDiklatForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

export default function InputDataPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    const res = await fetch(`/api/diklat?search=${search}&limit=50`);
    const json = await res.json();
    setData(json.data || []);
  };

  useEffect(() => {
    if (!isAdding) fetchData();
  }, [search, isAdding]);

  if (isAdding) {
    return <AddDiklatForm onBack={() => setIsAdding(false)} onSuccess={fetchData} />;
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold">Input Data Diklat</h1>
          <p className="text-slate-500">Kelola jadwal dan peserta.</p>
        </div>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="mr-2 h-4 w-4" /> Tambah
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Cari judul..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {data.map((item) => (
          <DiklatCard key={item.id} data={item} onRefresh={fetchData} />
        ))}
      </div>
    </div>
  );
}
