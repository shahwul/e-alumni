"use client";

import { useState, useEffect } from "react";
import { useFilterContext } from "../FilterContext";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider"; // Pastikan sudah diinstall
import { XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function KriteriaPTK() {
  const { filters, setFilters } = useFilterContext();

  // State lokal untuk slider agar mulus saat digeser (tidak hit API terus menerus)
  // Default range 20 - 60 tahun
  const [ageRange, setAgeRange] = useState([20, 60]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Sinkronisasi state lokal dengan global filters saat komponen dimuat
  useEffect(() => {
    if (filters.usia_min && filters.usia_max) {
      setAgeRange([Number(filters.usia_min), Number(filters.usia_max)]);
    } else {
      setAgeRange([20, 60]); // Default visual jika kosong
    }
  }, [filters.usia_min, filters.usia_max]);

  const handleApplyUsia = () => {
    setFilters((prev) => ({
      ...prev,
      usia_min: ageRange[0],
      usia_max: ageRange[1],
    }));
    setIsPopoverOpen(false);
  };

  const handleResetUsia = (e) => {
    e.stopPropagation();
    setFilters((prev) => ({
      ...prev,
      usia_min: null,
      usia_max: null,
    }));
    setAgeRange([20, 60]); // Reset visual
  };

  const hasJenjang = !!filters.jenjang;
  const hasMapel = !!filters.mapel;
  const hasStatus = !!filters.status;
  const hasUsiaFilter = !!filters.usia_min || !!filters.usia_max;

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
        <span className="h-4 w-1 bg-green-500 rounded-full" />
        Kriteria PTK
      </h4>

      <div className="grid grid-cols-2 gap-4">
        {/* ================= JENJANG ================= */}
        <div className="space-y-2">
          <Label className="text-xs text-slate-500">Jenjang</Label>
          <Select
            value={filters.jenjang || "ALL"}
            onValueChange={(val) =>
              setFilters((p) => ({
                ...p,
                jenjang: val === "ALL" ? "" : val,
              }))
            }
          >
            <SelectTrigger className="pr-2 h-9 text-xs">
              <div className="flex items-center justify-between w-full">
                <SelectValue placeholder="Semua" />
                {hasJenjang && (
                  <span
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFilters((p) => ({ ...p, jenjang: "" }));
                    }}
                    className="ml-2 flex h-5 w-5 items-center justify-center rounded hover:bg-red-50"
                  >
                    <XCircle className="h-3.5 w-3.5 text-red-400 hover:text-red-600" />
                  </span>
                )}
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua</SelectItem>
              <SelectItem value="PAUD">PAUD</SelectItem>
              <SelectItem value="SD">SD</SelectItem>
              <SelectItem value="SMP">SMP</SelectItem>
              <SelectItem value="SMA">SMA</SelectItem>
              <SelectItem value="SMK">SMK</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ================= MAPEL ================= */}
        <div className="space-y-2">
          <Label className="text-xs text-slate-500">Mapel</Label>
          <Select
            value={filters.mapel || "ALL"}
            onValueChange={(val) =>
              setFilters((p) => ({
                ...p,
                mapel: val === "ALL" ? "" : val,
              }))
            }
          >
            <SelectTrigger className="pr-2 h-9 text-xs">
              <div className="flex items-center justify-between w-full">
                <SelectValue placeholder="Semua" />
                {hasMapel && (
                  <span
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFilters((p) => ({ ...p, mapel: "" }));
                    }}
                    className="ml-2 flex h-5 w-5 items-center justify-center rounded hover:bg-red-50"
                  >
                    <XCircle className="h-3.5 w-3.5 text-red-400 hover:text-red-600" />
                  </span>
                )}
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua</SelectItem>
              <SelectItem value="Bahasa Indonesia">Bahasa Indonesia</SelectItem>
              <SelectItem value="Matematika">Matematika</SelectItem>
              <SelectItem value="IPA">IPA</SelectItem>
              <SelectItem value="IPS">IPS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ================= USIA (SLIDER) ================= */}
        <div className="space-y-2">
          <Label className="text-xs text-slate-500">Rentang Usia</Label>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between font-normal text-xs h-9 px-3",
                  !hasUsiaFilter && "text-muted-foreground"
                )}
              >
                {hasUsiaFilter
                  ? `${filters.usia_min} - ${filters.usia_max} Tahun`
                  : "Pilih Usia"}

                {hasUsiaFilter && (
                  <span
                    onClick={handleResetUsia}
                    className="ml-2 flex h-5 w-5 items-center justify-center rounded hover:bg-red-50"
                  >
                    <XCircle className="h-3.5 w-3.5 text-red-400 hover:text-red-600" />
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="start">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-medium text-slate-700">
                  <span className="bg-slate-100 px-2 py-1 rounded">Min: {ageRange[0]}</span>
                  <span className="text-slate-400">-</span>
                  <span className="bg-slate-100 px-2 py-1 rounded">Max: {ageRange[1]}</span>
                </div>

                <Slider
                  defaultValue={[20, 60]}
                  min={18}
                  max={65}
                  step={1}
                  value={ageRange}
                  onValueChange={setAgeRange}
                  className="py-2"
                />

                <Button
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 h-8 text-xs"
                  onClick={handleApplyUsia}
                >
                  Terapkan Range
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* ================= STATUS ================= */}
        <div className="space-y-2">
          <Label className="text-xs text-slate-500">Status Pelatihan</Label>
          <Select
            value={filters.status || "ALL"}
            onValueChange={(val) =>
              setFilters((p) => ({
                ...p,
                status: val === "ALL" ? "" : val,
              }))
            }
          >
            <SelectTrigger className="pr-2 h-9 text-xs">
              <div className="flex items-center justify-between w-full">
                <SelectValue placeholder="Semua" />
                {hasStatus && (
                  <span
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFilters((p) => ({ ...p, status: "" }));
                    }}
                    className="ml-2 flex h-5 w-5 items-center justify-center rounded hover:bg-red-50"
                  >
                    <XCircle className="h-3.5 w-3.5 text-red-400 hover:text-red-600" />
                  </span>
                )}
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua</SelectItem>
              <SelectItem value="sudah">Sudah Pelatihan</SelectItem>
              <SelectItem value="belum">Belum Pelatihan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}