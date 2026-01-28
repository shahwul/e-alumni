"use client";

import { useState } from "react";
import { useFilterContext } from "../FilterContext";
import { useDebounceSearch } from "../useDebounceSearch";

// UI
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

export function SekolahFilter() {
  const { filters, setFilters } = useFilterContext();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { results, loading } = useDebounceSearch({
    endpoint: "/api/sekolah/search",
    query: search,
  });

  const toggleSekolah = (nama) => {
    setFilters((p) => ({
      ...p,
      sekolah: p.sekolah.includes(nama)
        ? p.sekolah.filter((s) => s !== nama)
        : [...p.sekolah, nama],
    }));
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs text-slate-500">
        Nama Sekolah (Multi Select)
      </Label>

      {/* ===== POPOVER ===== */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between px-3 h-auto min-h-10 font-normal text-left"
          >
            <span className="truncate whitespace-normal">
              {filters.sekolah.length === 0
                ? "Ketik min 3 huruf..."
                : `${filters.sekolah.length} Sekolah Terpilih`}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[420px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Cari sekolah..."
              value={search}
              onValueChange={setSearch}
            />

            <CommandList>
              {loading && (
                <div className="p-4 text-xs text-center text-slate-500">
                  Mencari...
                </div>
              )}

              {!loading && results.length === 0 && search.length > 2 && (
                <CommandEmpty>Sekolah tidak ditemukan.</CommandEmpty>
              )}

              <CommandGroup>
                {results.map((item, idx) => {
                  const selected = filters.sekolah.includes(item.nama_sekolah);

                  return (
                    <CommandItem
                      key={idx}
                      value={item.nama_sekolah}
                      onSelect={() => toggleSekolah(item.nama_sekolah)}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center border rounded-sm",
                          selected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "opacity-50 border-slate-400",
                        )}
                      >
                        <Check
                          className={cn(
                            "h-3 w-3",
                            selected ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </div>
                      {item.nama_sekolah}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* ===== BADGES ===== */}
      {filters.sekolah.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {filters.sekolah.map((s, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="text-[10px] bg-white border border-slate-200 pr-1 py-1 h-auto whitespace-normal"
            >
              <span className="mr-1">{s}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSekolah(s);
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
            onClick={() => setFilters((p) => ({ ...p, sekolah: [] }))}
          >
            Reset Sekolah
          </Button>
        </div>
      )}
    </div>
  );
}
