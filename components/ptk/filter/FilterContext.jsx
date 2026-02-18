"use client";

import { createContext, useContext, useMemo, useState } from "react";

const DEFAULT_FILTERS = {
  kabupaten: [],
  kecamatan: [],
  sekolah: [],
  judul_diklat: [],

  jenjang: "",
  mapel: "",
  usia_min: "",
  usia_max: "",
  status: "",
  kategori: "",
  jenis: "",
  program: "",
  mode_filter: "eligible", 
  rumpun: "",
  sub_rumpun: "",
  dateRange: { from: undefined, to: undefined },
  
  jenis_kelamin: "",
  status_kepegawaian: "",
  jenis_ptk: "",
  pendidikan_terakhir: "",
  pendidikan_bidang: "",
  pangkat_golongan: "",
  kepala_sekolah: "",
};

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const resetFilters = () => setFilters(DEFAULT_FILTERS);
  const value = useMemo(
    () => ({ filters, setFilters, resetFilters }),
    [filters],
  );
  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

export function useFilterContext() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilterContext must be used within a FilterProvider");
  }
  return context;
}
