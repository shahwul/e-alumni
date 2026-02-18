"use client";

import { useState } from "react";
import { useFilterContext } from "../FilterContext";
import { useDebounceSearch } from "../useDebounceSearch";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandItem, CommandList, CommandGroup, CommandEmpty } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Check, XCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export function DiklatFilter() {
  const { filters, setFilters, schoolMapping, setSchoolMapping } = useFilterContext();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const dateFrom = filters.dateRange?.from ? format(filters.dateRange.from, "yyyy-MM-dd") : "";
  const dateTo = filters.dateRange?.to ? format(filters.dateRange.to, "yyyy-MM-dd") : "";

  const { results, loading } = useDebounceSearch({
    endpoint: "/api/diklat/search",
    query: search,
    extraParams: { 
      start_date: dateFrom,
      end_date: dateTo 
    },
  });

  const isDateSelected = !!filters.dateRange?.from;

  const toggleDiklat = (id, title) => {
    if (title) {
      setSchoolMapping(prev => ({ ...prev, [id]: title }));
    }

    setFilters((p) => ({
      ...p,
      judul_diklat: p.judul_diklat.includes(id)
        ? p.judul_diklat.filter((item) => item !== id)
        : [...p.judul_diklat, id],
    }));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2 sm:col-span-2">
        <div className="flex justify-between items-center">
          <Label className="text-xs text-slate-500 font-medium">
            Judul Diklat (Multi Select)
          </Label>
          {isDateSelected && (
            <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-200 bg-blue-50 py-0 h-5">
              <Calendar size={10} className="mr-1" /> Terfilter tanggal
            </Badge>
          )}
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between px-3 h-auto min-h-10 font-normal text-left border-slate-200 hover:bg-slate-50"
            >
              <span className="truncate whitespace-normal">
                {filters.judul_diklat.length === 0
                  ? "Ketik atau cari judul diklat..."
                  : `${filters.judul_diklat.length} Judul Terpilih`}
              </span>
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[450px] p-0 shadow-md border-slate-200" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Cari judul diklat..."
                value={search}
                onValueChange={setSearch}
                className="text-sm"
              />
              <CommandList 
                className="max-h-[300px] overflow-y-auto custom-scrollbar"
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                {loading && <div className="p-4 text-xs text-center text-slate-500">Mencari data...</div>}
                {!loading && results.length === 0 && (
                  <CommandEmpty className="p-4 text-xs text-center text-slate-500">
                    {isDateSelected 
                      ? "Tidak ada diklat di rentang tanggal ini." 
                      : "Judul diklat tidak ditemukan."}
                  </CommandEmpty>
                )}

                <CommandGroup>
                  {results.map((item) => {
                    const isSelected = filters.judul_diklat.includes(item.id);
                    return (
                      <CommandItem
                        key={item.id}
                        value={String(item.id)}
                        onSelect={() => toggleDiklat(item.id, item.title)}
                        className="flex items-center gap-3 py-3 px-3 cursor-pointer group"
                      >
                        {/* Checkbox Kiri Tengah */}
                        <div className="flex shrink-0">
                          <div className={cn(
                            "flex h-5 w-5 items-center justify-center border rounded transition-colors",
                            isSelected
                              ? "bg-blue-600 border-blue-600 shadow-sm"
                              : "border-slate-300 bg-white group-hover:border-blue-400",
                          )}>
                            <Check className={cn(
                              "h-3.5 w-3.5 text-white stroke-[3px] transition-opacity", 
                              isSelected ? "opacity-100" : "opacity-0"
                            )} />
                          </div>
                        </div>

                        {/* Kontainer Teks */}
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className={cn(
                            "font-medium text-sm leading-snug mb-1", 
                            isSelected ? "text-blue-700" : "text-slate-900"
                          )}>
                            {item.title}
                          </span>
                          
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                            <Calendar size={11} className="shrink-0 text-slate-400" /> 
                            <span>
                              {item.start_date ? format(new Date(item.start_date), "dd MMM yyyy", { locale: localeId }) : '-'}
                              {" s/d "}
                              {item.end_date ? format(new Date(item.end_date), "dd MMM yyyy", { locale: localeId }) : '-'}
                            </span>
                          </div>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Render Badges dari ID */}
        {filters.judul_diklat.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {filters.judul_diklat.map((id) => (
              <Badge 
                key={id} 
                variant="secondary" 
                className="text-[10px] bg-white border border-slate-200 pr-1 py-1 h-auto whitespace-normal"
              >
                <span className="mr-1">{schoolMapping[id] || `ID: ${id}`}</span>
                <button onClick={(e) => { e.stopPropagation(); toggleDiklat(id); }}>
                  <XCircle size={14} className="text-slate-400 hover:text-red-500 transition-colors" />
                </button>
              </Badge>
            ))}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-[10px] text-red-500 hover:bg-red-50" 
              onClick={() => setFilters((p) => ({ ...p, judul_diklat: [] }))}
            >
              Reset Judul
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}