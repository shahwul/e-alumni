"use client";

import { createContext, useContext, useMemo, useState } from "react";

const DEFAULT_FILTERS = {
  kabupaten: [],
  kecamatan: [],
  jenjang: "",
  status: "",
  sekolah: [],
  judul_diklat: [],
  kategori: "",
  jenis: "",
  program: "",
  mode_filter: "history",
  rumpun: "",
  sub_rumpun: "",
  dateRange: { from: undefined, to: undefined },
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
