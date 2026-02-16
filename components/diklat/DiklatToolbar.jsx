"use client";

import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function DiklatToolbar({ search, onSearchChange, onFilterClick, activeCount }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <Input 
          placeholder="Cari judul diklat..." 
          className="pl-10" 
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Button variant="outline" className="gap-2 border-dashed" onClick={onFilterClick}>
        <Filter size={16} /> Filter
        {activeCount > 0 && (
          <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
            {activeCount}
          </span>
        )}
      </Button>
    </div>
  );
}