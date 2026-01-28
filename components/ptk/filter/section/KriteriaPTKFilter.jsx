"use client";

import { useFilterContext } from "../FilterContext";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { XCircle } from "lucide-react";

export function KriteriaPTK() {
  const { filters, setFilters } = useFilterContext();

  const hasJenjang = !!filters.jenjang;
  const hasStatus = !!filters.status;

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
            <SelectTrigger className="pr-2">
              <div className="flex items-center justify-between w-full">
                <SelectValue placeholder="Semua" />

                {hasJenjang && (
                  <span
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFilters((p) => ({ ...p, jenjang: "" }));
                    }}
                    className="ml-2 flex h-6 w-6 items-center justify-center rounded hover:bg-red-50 "
                  >
                    <XCircle className="h-4 w-4 text-red-400 hover:text-red-600" />
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
            <SelectTrigger className="pr-2">
              <div className="flex items-center justify-between w-full">
                <SelectValue placeholder="Semua" />

                {hasStatus && (
                  <span
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFilters((p) => ({ ...p, status: "" }));
                    }}
                    className="ml-2 flex h-6 w-6 items-center justify-center rounded hover:bg-red-50 "
                  >
                    <XCircle className="h-4 w-4 text-red-400 hover:text-red-600" />
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
