"use client";

import KabupatenFilter from "./KabupatenFilter";
import KecamatanFilter from "./KecamatanFilter";
import TahunFilter from "./TahunFilter";
import DiklatFilter from "./DiklatFilter";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function FilterPanel({
  wilayahData,
  listKecamatan,
  selectedKab,
  selectedKec,
  selectedYear,
  selectedDiklat,
  heatmapEnable,
  loadingWilayah,
  onKabChange,
  onKecChange,
  onYearChange,
  onDiklatChange,
  onHeatmapToggle,
}) {
  return (
    <div className="space-y-6">
      <KabupatenFilter
        wilayahData={wilayahData}
        selectedKab={selectedKab}
        loadingWilayah={loadingWilayah}
        onChange={onKabChange}
      />
      <KecamatanFilter
        listKecamatan={listKecamatan}
        selectedKab={selectedKab}
        selectedKec={selectedKec}
        onChange={onKecChange}
      />
      <TahunFilter selectedYear={selectedYear} onChange={onYearChange} />
      <DiklatFilter selectedDiklat={selectedDiklat} onChange={onDiklatChange} />

      {/* Heatmap Toggle */}
      <div className="pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="heatmap-switch"
            className="text-sm font-medium text-slate-700"
          >
            Persebaran
          </Label>

          <Switch
            id="heatmap-switch"
            checked={heatmapEnable}
            onCheckedChange={onHeatmapToggle}
          />
        </div>

        <p className="mt-2 text-xs text-slate-500">
          Aktifkan untuk menampilkan distribusi lulusan dalam bentuk persebaran.
        </p>
      </div>
    </div>
  );
}
