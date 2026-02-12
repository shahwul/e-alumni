"use client";

import { useEffect, useState } from "react";
import { buildPTKParams } from "./buildPTKParams";

export function usePTKList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalData, setTotalData] = useState(0);

  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([{ id: "nama", desc: false }]);

  const [activeFilters, setActiveFilters] = useState({
    kabupaten: [],
    kecamatan: [],
    jenjang: "",
    mapel: "",
    usia_min: "",
    usia_max: "",

    status: "",
    sekolah: [],
    judul_diklat: [],
    kategori: "",
    jenis: "",
    program: "",
    mode_filter: "eligible",
    rumpun: "",
    sub_rumpun: "",
    dateRange: { from: undefined, to: undefined },
  });

  useEffect(() => {
    setPage(1);
  }, [search, sorting, activeFilters]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const params = buildPTKParams({
          page,
          limit,
          search,
          sorting,
          activeFilters,
        });

        const res = await fetch(`/api/ptk?${params.toString()}`);
        const json = await res.json();

        setData(json.data || []);
        setTotalData(json.meta?.totalData || 0);
      } catch (err) {
        console.error("Gagal fetch PTK", err);
      } finally {
        setLoading(false);
      }
    };

    const t = setTimeout(fetchData, 400);
    return () => clearTimeout(t);
  }, [search, sorting, activeFilters, page, limit]);

  const handleExport = (mode) => {
    const params = buildPTKParams({
      search,
      sorting,
      activeFilters: {
        ...activeFilters,
        mode_filter: mode ?? activeFilters.mode_filter,
      },
      withPagination: false,
    });

    window.location.href = `/api/ptk/export?${params.toString()}`;
  };

  return {
    data,
    loading,
    page,
    limit,
    totalData,
    search,
    sorting,
    activeFilters,

    setPage,
    setLimit,
    setSearch,
    setSorting,
    setActiveFilters,

    onExport: handleExport,
  };
}
