"use client";

import { useFilterContext } from "../FilterContext";
import { useFilterData } from "../useFilterData";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { XCircle } from "lucide-react";

const JENIS_OPTIONS = [
  { label: "Pelatihan", value: "Pelatihan" },
  { label: "Non Pelatihan", value: "Non_Pelatihan" },
];

const PROGRAM_OPTIONS = [
  { label: "Nasional", value: "Nasional" },
  { label: "BBGTK DIY", value: "BBGTK_DIY" },
];

export function KategoriJenisProgramFilter() {
  const { filters, setFilters } = useFilterContext();
  const { kategoriOption } = useFilterData(filters, setFilters);

  const hasKategori = !!filters.kategori && filters.kategori !== "ALL";
  const hasJenis = !!filters.jenis && filters.jenis !== "ALL";
  const hasProgram = !!filters.program && filters.program !== "ALL";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* ================= Kategori ================= */}
      <div className="space-y-2">
        <Label className="text-xs text-slate-500">Kategori Kegiatan</Label>

        <Select
          value={filters.kategori || "ALL"}
          onValueChange={(v) =>
            setFilters((p) => ({
              ...p,
              kategori: v === "ALL" ? "" : v,
            }))
          }
        >
          <SelectTrigger className="pr-2">
            <div className="flex items-center justify-between w-full">
              <SelectValue placeholder="Semua Kategori" />

              {hasKategori && (
                <span
                  role="button"
                  tabIndex={0}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFilters((p) => ({ ...p, kategori: "" }));
                  }}
                  className="ml-2 flex h-6 w-6 items-center justify-center rounded hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 text-red-400 hover:text-red-600" />
                </span>
              )}
            </div>
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="ALL">Semua</SelectItem>
            {kategoriOption.map((opt) => (
              <SelectItem key={opt.id} value={String(opt.id)}>
                {opt.category_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* ================= Jenis ================= */}
      <div className="space-y-2">
        <Label className="text-xs text-slate-500">Jenis Kegiatan</Label>
        <Select
          value={filters.jenis || "ALL"}
          onValueChange={(val) =>
            setFilters((p) => ({
              ...p,
              jenis: val === "ALL" ? "" : val, // val sudah mengandung underscore dari <SelectItem />
            }))
          }
        >
          <SelectTrigger className="pr-2">
            <div className="flex items-center justify-between w-full">
              <SelectValue placeholder="Semua Jenis" />
              {hasJenis && (
                <span
                  role="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFilters((p) => ({ ...p, jenis: "" }));
                  }}
                  className="ml-2 flex h-6 w-6 items-center justify-center rounded hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 text-red-400 hover:text-red-600" />
                </span>
              )}
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua</SelectItem>
            {JENIS_OPTIONS.map((opt) => (
              // Value dikirim dengan underscore, Label tampil dengan spasi
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ================= PROGRAM ================= */}
      <div className="space-y-2">
        <Label className="text-xs text-slate-500">Sumber Program</Label>
        <Select
          value={filters.program || "ALL"}
          onValueChange={(val) =>
            setFilters((p) => ({
              ...p,
              program: val === "ALL" ? "" : val,
            }))
          }
        >
          <SelectTrigger className="pr-2">
            <div className="flex items-center justify-between w-full">
              <SelectValue placeholder="Semua Program" />
              {hasProgram && (
                <span
                  role="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFilters((p) => ({ ...p, program: "" }));
                  }}
                  className="ml-2 flex h-6 w-6 items-center justify-center rounded hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 text-red-400 hover:text-red-600" />
                </span>
              )}
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua</SelectItem>
            {PROGRAM_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
