"use client";

import { useState, useEffect } from "react";
import { buildPTKParams } from "./buildPTKParams";

export function usePTKList(searchParams) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalData, setTotalData] = useState(0);

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 25; 
  const search = searchParams.get("search") || "";

  const sortParam = searchParams.get("sort");
  const sorting = sortParam 
    ? [{ id: sortParam.split(":")[0], desc: sortParam.split(":")[1] === "desc" }] 
    : [{ id: "nama", desc: false }];

  const activeFilters = {
    kabupaten: searchParams.getAll("kabupaten"),
    kecamatan: searchParams.getAll("kecamatan"),
    sekolah: searchParams.getAll("sekolah"),
    judul_diklat: searchParams.getAll("judul_diklat"),

    jenjang: searchParams.get("jenjang") || "",
    mapel: searchParams.get("mapel") || "",
    usia_min: searchParams.get("usia_min") || "",
    usia_max: searchParams.get("usia_max") || "",
    status: searchParams.get("status") || "", 
    kategori: searchParams.get("kategori") || "",
    jenis: searchParams.get("jenis") || "",
    program: searchParams.get("program") || "",
    mode_filter: searchParams.get("mode_filter") || "eligible",
    rumpun: searchParams.get("rumpun") || "",
    sub_rumpun: searchParams.get("sub_rumpun") || "",

    jenis_kelamin: searchParams.get("jenis_kelamin") || "",
    status_kepegawaian: searchParams.get("status_kepegawaian") || "",
    jenis_ptk: searchParams.get("jenis_ptk") || "",
    pendidikan_terakhir: searchParams.get("pendidikan_terakhir") || "",
    pendidikan_bidang: searchParams.get("pendidikan_bidang") || "",
    pangkat_golongan: searchParams.get("pangkat_golongan") || "",
    kepala_sekolah: searchParams.get("kepala_sekolah") || "",

    dateRange: {
      from: searchParams.get("date_from") ? new Date(searchParams.get("date_from")) : undefined,
      to: searchParams.get("date_to") ? new Date(searchParams.get("date_to")) : undefined,
    },
  };

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

    fetchData();
    
  }, [searchParams.toString()]); 

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
    totalData,
    page,
    limit,
    search,
    sorting,
    activeFilters,
    onExport: handleExport,
  };
}