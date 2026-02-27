"use client";

import { useState, useEffect } from "react";
import { useFilterContext } from "../FilterContext";
import { usePTKMetadata, useBentukPendidikan } from "../hooks/useReferences";
import { SearchableSelect } from "@/components/ui/searchable-select";

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
import { Slider } from "@/components/ui/slider";
import { XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function KriteriaPTK() {
  const { filters, setFilters } = useFilterContext();

  const {
    jenisPtk,
    statusKepegawaian,
    mapel,
    jurusan,
    isLoading
  } = usePTKMetadata();

  const { bentukPendidikan, isLoading: isLoadingBentuk } = useBentukPendidikan();

  const [ageRange, setAgeRange] = useState([20, 60]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    if (filters.usia_min && filters.usia_max) {
      setAgeRange([Number(filters.usia_min), Number(filters.usia_max)]);
    } else {
      setAgeRange([20, 60]);
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
    setFilters((prev) => ({ ...prev, usia_min: null, usia_max: null }));
    setAgeRange([20, 60]);
  };

  const ClearButton = ({ field }) => (
    <span
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setFilters((p) => ({ ...p, [field]: "" }));
      }}
      className="ml-2 flex h-5 w-5 items-center justify-center rounded hover:bg-red-50 cursor-pointer"
    >
      <XCircle className="h-3.5 w-3.5 text-red-400 hover:text-red-600" />
    </span>
  );

  const hasUsiaFilter = !!filters.usia_min || !!filters.usia_max;
  const isAnyLoading = isLoading || isLoadingBentuk;

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
        <span className="h-4 w-1 bg-green-500 rounded-full" />
        Kriteria PTK
        {/* Indikator Loading Data Referensi */}
        {isAnyLoading && <Loader2 className="h-3 w-3 animate-spin text-slate-400" />}
      </h4>

      <div className="grid grid-cols-2 gap-x-3 gap-y-4">

        {/* ================= 1. JENJANG / BENTUK PENDIDIKAN ================= */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Bentuk Pendidikan</Label>
          <Select
            value={filters.jenjang || "ALL"}
            onValueChange={(val) => setFilters((p) => ({ ...p, jenjang: val === "ALL" ? "" : val }))}
            disabled={isLoadingBentuk}
          >
            <SelectTrigger className="h-9 text-xs">
              <div className="flex items-center justify-between w-full pr-2">
                <SelectValue placeholder={isLoadingBentuk ? "Memuat..." : "Semua"} />
                {filters.jenjang && <ClearButton field="jenjang" />}
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua</SelectItem>
              {bentukPendidikan.map((bp) => (
                <SelectItem key={bp} value={bp}>{bp}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ================= 2. MAPEL (AUTOCOMPLETE) ================= */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Mapel / Sertifikasi</Label>
          <SearchableSelect
            value={filters.mapel}
            onChange={(val) => setFilters(p => ({ ...p, mapel: val }))}
            options={mapel}
            placeholder="Pilih Mapel..."
            emptyMessage="Mapel tidak ditemukan"
          />
        </div>

        {/* ================= 3. RENTANG USIA ================= */}
        <div className="space-y-1.5">
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
                {hasUsiaFilter ? `${filters.usia_min} - ${filters.usia_max} Thn` : "Pilih Usia"}
                {hasUsiaFilter && (
                  <span onClick={handleResetUsia} className="ml-2 hover:bg-red-50 rounded p-0.5">
                    <XCircle className="h-3.5 w-3.5 text-red-400" />
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4">
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium">
                  <span className="bg-slate-100 px-2 py-1 rounded">Min: {ageRange[0]}</span>
                  <span className="bg-slate-100 px-2 py-1 rounded">Max: {ageRange[1]}</span>
                </div>
                <Slider
                  defaultValue={[20, 60]} min={18} max={65} step={1}
                  value={ageRange} onValueChange={setAgeRange}
                />
                <Button size="sm" className="w-full bg-blue-600 h-8 text-xs" onClick={handleApplyUsia}>
                  Terapkan
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* ================= 4. STATUS KEPEGAWAIAN (DYNAMIC) ================= */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Status Kepegawaian</Label>
          <Select
            value={filters.status_kepegawaian || "ALL"}
            onValueChange={(val) => setFilters((p) => ({ ...p, status_kepegawaian: val === "ALL" ? "" : val }))}
            disabled={isLoading}
          >
            <SelectTrigger className="h-9 text-xs">
              <div className="flex items-center justify-between w-full pr-2">
                <SelectValue placeholder={isLoading ? "Memuat..." : "Semua"} />
                {filters.status_kepegawaian && <ClearButton field="status_kepegawaian" />}
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua</SelectItem>
              {/* Mapping Data dari API */}
              {statusKepegawaian.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ================= 5. JENIS PTK (DYNAMIC) ================= */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Jenis PTK</Label>
          <Select
            value={filters.jenis_ptk || "ALL"}
            onValueChange={(val) => setFilters((p) => ({ ...p, jenis_ptk: val === "ALL" ? "" : val }))}
            disabled={isLoading}
          >
            <SelectTrigger className="h-9 text-xs">
              <div className="flex items-center justify-between w-full pr-2">
                <SelectValue placeholder={isLoading ? "Memuat..." : "Semua"} />
                {filters.jenis_ptk && <ClearButton field="jenis_ptk" />}
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua</SelectItem>
              {/* Mapping Data dari API */}
              {jenisPtk.map((jenis) => (
                <SelectItem key={jenis} value={jenis}>{jenis}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ================= 6. PENDIDIKAN TERAKHIR (HARDCODE) ================= */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Pendidikan Terakhir</Label>
          <Select
            value={filters.pendidikan_terakhir || "ALL"}
            onValueChange={(val) => setFilters((p) => ({ ...p, pendidikan_terakhir: val === "ALL" ? "" : val }))}
          >
            <SelectTrigger className="h-9 text-xs">
              <div className="flex items-center justify-between w-full pr-2">
                <SelectValue placeholder="Semua" />
                {filters.pendidikan_terakhir && <ClearButton field="pendidikan_terakhir" />}
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua</SelectItem>
              <SelectItem value="S3">S3</SelectItem>
              <SelectItem value="S2">S2</SelectItem>
              <SelectItem value="S1">S1</SelectItem>
              <SelectItem value="D4">D4</SelectItem>
              <SelectItem value="D3">D3</SelectItem>
              <SelectItem value="SMA">SMA / Sederajat</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ================= 7. JURUSAN (AUTOCOMPLETE) ================= */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Jurusan / Bidang</Label>
          <SearchableSelect
            value={filters.pendidikan_bidang}
            onChange={(val) => setFilters(p => ({ ...p, pendidikan_bidang: val }))}
            options={jurusan}
            placeholder="Cari Jurusan..."
            emptyMessage="Jurusan tidak ditemukan"
          />
        </div>

        {/* ================= 8. STATUS KEPALA SEKOLAH ================= */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Kepala Sekolah?</Label>
          <Select
            value={filters.kepala_sekolah || "ALL"}
            onValueChange={(val) => setFilters((p) => ({ ...p, kepala_sekolah: val === "ALL" ? "" : val }))}
          >
            <SelectTrigger className="h-9 text-xs">
              <div className="flex items-center justify-between w-full pr-2">
                <SelectValue placeholder="Semua" />
                {filters.kepala_sekolah && <ClearButton field="kepala_sekolah" />}
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua</SelectItem>
              <SelectItem value="true">Ya (Kepsek)</SelectItem>
              <SelectItem value="false">Bukan Kepsek</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ================= 9. STATUS PELATIHAN ================= */}
        <div className="space-y-1.5 col-span-2">
          <Label className="text-xs text-slate-500">Status Pelatihan</Label>
          <Select
            value={filters.status || "ALL"}
            onValueChange={(val) => setFilters((p) => ({ ...p, status: val === "ALL" ? "" : val }))}
          >
            <SelectTrigger className="h-9 text-xs">
              <div className="flex items-center justify-between w-full pr-2">
                <SelectValue placeholder="Semua Status" />
                {filters.status && <ClearButton field="status" />}
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="sudah">Sudah Pelatihan</SelectItem>
              <SelectItem value="belum">Belum Pelatihan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* JENIS KELAMIN */}
        <div className="space-y-1.5 col-span-2">
          <Label className="text-xs text-slate-500">Jenis Kelamin</Label>
          <Select
            value={filters.jenis_kelamin || "ALL"}
            onValueChange={(val) => setFilters((p) => ({ ...p, jenis_kelamin: val === "ALL" ? "" : val }))}
          >
            <SelectTrigger className="h-9 text-xs">
              <div className="flex items-center justify-between w-full pr-2">
                <SelectValue placeholder="Semua Jenis Kelamin" />
                {filters.jenis_kelamin && <ClearButton field="jenis_kelamin" />}
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Jenis Kelamin</SelectItem>
              <SelectItem value="L">Laki-laki</SelectItem>
              <SelectItem value="P">Perempuan</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>
    </div>
  );
}