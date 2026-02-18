"use client";

import { useMemo, useState } from "react";
import { useFilterContext } from "../FilterContext";
import { useFilterData } from "../useFilterData";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandInput,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function WilayahFilter() {
  const { filters, setFilters } = useFilterContext();
  const { wilayah } = useFilterData(filters, setFilters);

  const [openKab, setOpenKab] = useState(false);
  const [openKec, setOpenKec] = useState(false);

  const toggleKabupaten = (kab) => {
    setFilters((prev) => ({
      ...prev,
      kabupaten: prev.kabupaten.includes(kab)
        ? prev.kabupaten.filter((k) => k !== kab)
        : [...prev.kabupaten, kab],
    }));
  };

  const toggleKecamatan = (kec) => {
    setFilters((prev) => ({
      ...prev,
      kecamatan: prev.kecamatan.includes(kec)
        ? prev.kecamatan.filter((k) => k !== kec)
        : [...prev.kecamatan, kec],
    }));
  };

  const displayedWilayah = useMemo(() => {
    if (filters.kabupaten.length === 0) return wilayah;
    return wilayah.filter((w) => filters.kabupaten.includes(w.kabupaten));
  }, [wilayah, filters.kabupaten]);

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
        <span className="h-4 w-1 bg-blue-600 rounded-full"></span> Wilayah
      </h4>

      <div className="flex flex-col gap-4">
        {/* KABUPATEN */}
        <div className="space-y-2">
          <Label className="text-xs text-slate-500">
            Kabupaten/Kota (Bisa pilih banyak)
          </Label>
          <Popover open={openKab} onOpenChange={setOpenKab}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between px-3 font-normal text-sm"
              >
                <span className="truncate">
                  {filters.kabupaten.length === 0
                    ? "Semua Kabupaten"
                    : `${filters.kabupaten.length} Kabupaten Terpilih`}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="start"
              sideOffset={4}
              className="w-112.5 p-0"
            >
              <Command>
                <CommandInput placeholder="Cari kabupaten..." />
                <CommandList onWheel={(e) => e.stopPropagation()}>
                  <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                  <CommandGroup>
                    {wilayah.map((w) => (
                      <CommandItem
                        key={w.kabupaten}
                        value={w.kabupaten}
                        onSelect={() => toggleKabupaten(w.kabupaten)}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center border rounded-sm",
                            filters.kabupaten.includes(w.kabupaten)
                              ? "bg-primary border-primary text-primary-foreground"
                              : "opacity-50 border-slate-400",
                          )}
                        >
                          <Check
                            className={cn(
                              "h-3 w-3 text-white transition-opacity",
                              filters.kabupaten.includes(w.kabupaten)
                                ? "opacity-100 "
                                : "opacity-0",
                            )}
                          />
                        </div>
                        {w.kabupaten}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {filters.kabupaten.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {filters.kabupaten.map((k) => (
                <Badge
                  key={k}
                  variant="secondary"
                  className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 pointer-events-auto pr-1"
                >
                  {k}
                  <button
                    className="ml-1 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleKabupaten(k);
                    }}
                  >
                    <XCircle className="h-3 w-3 text-blue-400 hover:text-red-500" />
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-5 text-[10px] text-red-500"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, kabupaten: [] }))
                }
              >
                Reset Kabupaten
              </Button>
            </div>
          )}
        </div>

        {/* KECAMATAN */}
        <div className="space-y-2">
          <Label className="text-xs text-slate-500">Kecamatan</Label>
          <Popover open={openKec} onOpenChange={setOpenKec}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between px-3 font-normal text-sm"
              >
                <span className="truncate">
                  {filters.kecamatan.length === 0
                    ? "Pilih Kecamatan..."
                    : `${filters.kecamatan.length} Kecamatan Terpilih`}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="start"
              sideOffset={4}
              className="w-112.5 p-0"
            >
              <Command>
                <CommandInput placeholder="Cari kecamatan..." />
                <CommandList onWheel={(e) => e.stopPropagation()}>
                  <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                  {displayedWilayah.map((group) => (
                    <CommandGroup
                      key={group.kabupaten}
                      heading={group.kabupaten}
                    >
                      {group.kecamatan?.map((kec) => (
                        <CommandItem
                          key={kec}
                          value={kec}
                          onSelect={() => toggleKecamatan(kec)}
                        >
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center border rounded-sm",
                              filters.kecamatan.includes(kec)
                                ? "bg-primary border-primary text-primary-foreground"
                                : "opacity-50 border-slate-400",
                            )}
                          >
                            <Check
                              className={cn(
                                "h-3 w-3 text-white transition-opacity",
                                filters.kecamatan.includes(kec)
                                  ? "opacity-100 "
                                  : "opacity-0",
                              )}
                            />
                          </div>
                          {kec}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {filters.kecamatan.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {filters.kecamatan.map((k) => (
                <Badge
                  key={k}
                  variant="secondary"
                  className="text-[10px] bg-slate-100 text-slate-700 border-slate-200 pointer-events-auto pr-1"
                >
                  {k}
                  <button
                    className="ml-1 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleKecamatan(k);
                    }}
                  >
                    <XCircle className="h-3 w-3 text-slate-400 hover:text-red-500" />
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-5 text-[10px] text-red-500"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, kecamatan: [] }))
                }
              >
                Reset Kecamatan
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
