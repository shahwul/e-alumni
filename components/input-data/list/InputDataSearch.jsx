"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function InputDataSearch({ search, setSearch }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
      <Input
        placeholder="Cari judul..."
        className="pl-10"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}
