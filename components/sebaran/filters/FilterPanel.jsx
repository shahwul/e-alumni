"use client";

import KabupatenFilter from "./KabupatenFilter";
import KecamatanFilter from "./KecamatanFilter";
import TahunFilter from "./TahunFilter";

export default function FilterPanel({
  wilayahData,
  listKecamatan,
  selectedKab,
  selectedKec,
  selectedYear,
  loadingWilayah,
  onKabChange,
  onKecChange,
  onYearChange,
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

      <TahunFilter
        selectedYear={selectedYear}
        onChange={onYearChange}
      />
    </div>
  );
}
