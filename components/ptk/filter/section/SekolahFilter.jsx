"use client";

import { useState, useEffect } from "react";
import { useFilterContext } from "../FilterContext";
import { useDebounceSearch } from "../useDebounceSearch";

// UI Components
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandItem, CommandList, CommandGroup, CommandEmpty } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Check, XCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function SekolahFilter() {
  // 1. Ambil state mapping dari Context (bukan useState lokal lagi)
  const { filters, setFilters, schoolMapping, setSchoolMapping } = useFilterContext();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { results, loading } = useDebounceSearch({
    endpoint: "/api/sekolah/search",
    query: search,
  });

  // 2. Simpan mapping NPSN -> Nama ke Global Context setiap kali search berhasil
  useEffect(() => {
    if (results?.length > 0) {
      setSchoolMapping(prev => {
        const newMap = { ...prev };
        results.forEach(item => {
          // Sesuaikan dengan key API kamu: npsn_sekolah
          newMap[item.npsn_sekolah] = item.nama_sekolah;
        });
        return newMap;
      });
    }
  }, [results, setSchoolMapping]);

  const toggleSekolah = (npsn, nama) => {
    // Jika dipilih dari list, pastikan namanya masuk ke mapping global
    if (nama) {
      setSchoolMapping(prev => ({ ...prev, [npsn]: nama }));
    }

    setFilters((p) => ({
      ...p,
      sekolah: p.sekolah.includes(npsn)
        ? p.sekolah.filter((s) => s !== npsn)
        : [...p.sekolah, npsn],
    }));
  };

  return (
    <div className="space-y-2">
      <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        Sekolah (NPSN)
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between px-3 h-auto min-h-10 font-normal text-left"
          >
            <div className="flex items-center gap-2 truncate">
              <Search size={14} className="text-slate-400" />
              <span className="truncate">
                {filters.sekolah.length === 0
                  ? "Cari NPSN atau Nama..."
                  : `${filters.sekolah.length} Sekolah dipilih`}
              </span>
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[400px] p-0 shadow-xl" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Ketik minimal 3 huruf..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList className="max-h-[300px] overflow-y-auto custom-scrollbar">
              {loading && <div className="p-4 text-xs text-center text-slate-500 animate-pulse">Mencari...</div>}
              {!loading && results?.length === 0 && search.length > 2 && (
                <CommandEmpty className="p-4 text-xs text-center">Sekolah tidak ditemukan.</CommandEmpty>
              )}
              <CommandGroup>
                {results?.map((item) => {
                  const isSelected = filters.sekolah.includes(item.npsn_sekolah);
                  return (
                    <CommandItem
                      key={item.npsn_sekolah}
                      onSelect={() => toggleSekolah(item.npsn_sekolah, item.nama_sekolah)}
                      className="cursor-pointer py-2"
                    >
                      <div className={cn(
                        "mr-3 flex h-4 w-4 items-center justify-center border rounded transition-all",
                        isSelected ? "bg-blue-600 border-blue-600 text-white" : "opacity-50 border-slate-300"
                      )}>
                        <Check className={cn("h-3 w-3 text-white transition-opacity", isSelected ? "opacity-100" : "opacity-0")} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">{item.nama_sekolah}</span>
                        <span className="text-[10px] text-slate-500 font-mono italic">NPSN: {item.npsn_sekolah}</span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* RENDER BADGES MENGGUNAKAN GLOBAL MAPPING */}
      {filters.sekolah.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {filters.sekolah.map((npsn) => (
            <Badge
              key={npsn}
              variant="secondary"
              className="group text-[10px] bg-blue-50 text-blue-700 border-blue-100"
            >
              <span className="max-w-[150px] truncate">
                {/* AMBIL DARI CONTEXT schoolMapping */}
                {schoolMapping[npsn] || `NPSN: ${npsn}`}
              </span>
              <button
                className="ml-1"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSekolah(npsn);
                }}
              >
                <XCircle size={14} className="text-blue-400 group-hover:text-red-500 transition-colors" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] text-red-500"
            onClick={() => setFilters((p) => ({ ...p, sekolah: [] }))}
          >
            Reset Sekolah
          </Button>
        </div>
      )}
    </div>
  );
}