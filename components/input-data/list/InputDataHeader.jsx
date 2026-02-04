"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function InputDataHeader({ onAdd }) {
  return (
    <div className="flex justify-between">
      <div>
        <h1 className="text-3xl font-bold">Input Data Diklat</h1>
        <p className="text-slate-500">Kelola jadwal dan peserta.</p>
      </div>

      <Button onClick={onAdd}>
        <Plus className="mr-2 h-4 w-4" /> Tambah
      </Button>
    </div>
  );
}
