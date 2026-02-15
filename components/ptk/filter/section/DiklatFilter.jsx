"use client";

import { useState } from "react";
import { useFilterContext } from "../FilterContext";
import { useDebounceSearch } from "../useDebounceSearch";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandGroup,
  CommandEmpty,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Check, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function DiklatFilter() {
  const { filters, setFilters } = useFilterContext();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const { results, loading } = useDebounceSearch({
    endpoint: "/api/diklat/search",
    query: search,
  });

  const isDateSelected = !!filters.dateRange?.from;

  const toggleDiklat = (title) => {
    setFilters((p) => ({
      ...p,
      judul_diklat: p.judul_diklat.includes(title)
        ? p.judul_diklat.filter((j) => j !== title)
        : [...p.judul_diklat, title],
    }));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2 sm:col-span-2">
        {/* Label */}
        <div className="flex justify-between items-center">
          <Label
            className={cn(
              "text-xs",
              isDateSelected ? "text-slate-400" : "text-slate-500",
            )}
          >
            Judul Diklat (Multi Select)
          </Label>
          {isDateSelected && (
            <span className="text-[10px] text-red-500 italic">
              Reset tanggal untuk memilih judul
            </span>
          )}
        </div>

        {/* Popover */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              disabled={isDateSelected}
              variant="outline"
              role="combobox"
              className={cn(
                "w-full justify-between px-3 h-auto min-h-10 font-normal text-left",
                isDateSelected && "bg-slate-100 text-slate-400",
              )}
            >
              <span className="truncate whitespace-normal">
                {filters.judul_diklat.length === 0
                  ? isDateSelected
                    ? "Terkunci (Mode Tanggal Aktif)"
                    : "Ketik judul..."
                  : `${filters.judul_diklat.length} Judul Terpilih`}
              </span>
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-100 p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Ketik min 3 huruf..."
                value={search}
                onValueChange={setSearch}
              />
              <CommandList
                className="max-h-[250px] overflow-y-auto overflow-x-hidden custom-scrollbar"
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                {loading && (
                  <div className="p-4 text-xs text-center text-slate-500">
                    Mencari...
                  </div>
                )}

                {!loading && results.length === 0 && search.length > 2 && (
                  <CommandEmpty>Diklat tidak ditemukan.</CommandEmpty>
                )}

                <CommandGroup>
                  {results.map((item, idx) => (
                    <CommandItem
                      key={idx}
                      value={item.title}
                      onSelect={() => toggleDiklat(item.title)}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center border rounded-sm",
                          filters.judul_diklat.includes(item.title)
                            ? "bg-primary border-primary text-primary-foreground"
                            : "opacity-50 border-slate-400",
                        )}
                      >
                        <Check
                          className={cn(
                            "h-3 w-3",
                            filters.judul_diklat.includes(item.title)
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                      </div>
                      {item.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Badge terpilih */}
        {filters.judul_diklat.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {filters.judul_diklat.map((t, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-[10px] bg-white border border-slate-200 pr-1 py-1 h-auto whitespace-normal"
              >
                <span className="mr-1">{t}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDiklat(t);
                  }}
                >
                  <XCircle
                    size={14}
                    className="text-slate-400 hover:text-red-500"
                  />
                </button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] text-red-500"
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
