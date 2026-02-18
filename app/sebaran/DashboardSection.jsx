"use client";

import { useEffect, useMemo, useState } from "react";
import MapPanel from "@/components/sebaran/MapPanel";
import FilterPanel from "@/components/sebaran/filters/FilterPanel";
import DataSection from "./DataSection";
import { KAB_CODE_TO_NAME, YEAR_LIST } from "@/lib/constants";

export default function DashboardClient() {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [wilayahData, setWilayahData] = useState([]);
  const [selectedKab, setSelectedKab] = useState("");
  const [selectedKec, setSelectedKec] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDiklat, setSelectedDiklat] = useState("");
  const [loadingWilayah, setLoadingWilayah] = useState(true);

  useEffect(() => {
    fetch("/data/yogya.geojson")
      .then((res) => res.json())
      .then(setGeoJsonData)
      .catch(console.error);

    fetch("/api/ref/wilayah")
      .then((res) => res.json())
      .then((data) => {
        setWilayahData(data);
        setLoadingWilayah(false);
      })
      .catch(console.error);
  }, []);

  const listKecamatan = useMemo(() => {
    if (!selectedKab) return [];
    const kabName = KAB_CODE_TO_NAME[selectedKab];
    return wilayahData.find((w) => w.kabupaten === kabName)?.kecamatan || [];
  }, [wilayahData, selectedKab]);

  return (
    <div className="flex flex-col h-full gap-4 p-4 bg-white overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-4 h-[60%] shrink-0">
        <MapPanel
          geoJsonData={geoJsonData}
          wilayahData={wilayahData}
          selectedKab={selectedKab}
          selectedKec={selectedKec}
          selectedYear={selectedYear}
          selectedDiklat={selectedDiklat}
          onSelect={(kab, kec) => {
            setSelectedKab(kab);
            setSelectedKec(kec);
          }}
        />

        <FilterPanel
          wilayahData={wilayahData}
          listKecamatan={listKecamatan}
          selectedKab={selectedKab}
          selectedKec={selectedKec}
          selectedYear={selectedYear}
          selectedDiklat={selectedDiklat}
          loadingWilayah={loadingWilayah}
          onKabChange={(v) => {
            setSelectedKab(v);
            setSelectedKec("");
          }}
          onKecChange={setSelectedKec}
          onYearChange={setSelectedYear}
          onDiklatChange={setSelectedDiklat}
          onReset={() => {
            setSelectedKab("");
            setSelectedKec("");
          }}
        />
      </div>

      <DataSection
        selectedKab={selectedKab}
        selectedKec={selectedKec}
        selectedYear={selectedYear}
        selectedDiklat={selectedDiklat}
      />
    </div>
  );
}
