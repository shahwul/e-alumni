"use client";
import { useEffect, useState } from "react";

export function useFilterData(filters, setFilters) {
  const [wilayah, setWilayah] = useState([]);
  const [rumpunOptions, setRumpunOptions] = useState([]);
  const [subRumpunOptions, setSubRumpunOptions] = useState([]);
  const [kategoriOption, setKategoriOption] = useState([]);

  // 1. Fetch filter wilayah
  useEffect(() => {
    async function fetchWilayah() {
      try {
        const response = await fetch("/api/ref/wilayah");
        const data = await response.json();
        console.log("Fetched wilayah data:", data);
        if (Array.isArray(data)) {
          setWilayah(data);
        }
      } catch (error) {
        console.error("gagal fetch wilayah");
      }
    }
    fetchWilayah();
  }, []);

  // 2. Fetch filter rumpun
  useEffect(() => {
    async function fetchRumpun() {
      try {
        const res = await fetch("/api/ref/rumpun");
        if (res.ok) {
          const data = await res.json();
          setRumpunOptions(data);
        }
      } catch (err) {
        console.error("Gagal load rumpun:", err);
      }
    }
    fetchRumpun();
  }, []);

  // 3. Fetch filter sub-rumpun
  useEffect(() => {
    if (!filters.rumpun || filters.rumpun === "ALL") {
      setSubRumpunOptions([]);
      setFilters((prev) => ({ ...prev, sub_rumpun: "" }));
      return;
    }

    async function fetchSubRumpun() {
      try {
        const res = await fetch(
          `/api/ref/sub-rumpun?topic_id=${filters.rumpun}`,
        );
        if (res.ok) {
          const data = await res.json();
          setSubRumpunOptions(data);
        }
      } catch (err) {
        console.error("Gagal load sub rumpun:", err);
      }
    }

    setFilters((prev) => ({ ...prev, sub_rumpun: "" }));
    fetchSubRumpun();
  }, [filters.rumpun, setFilters]);

  useEffect(() => {
    async function fetchKategori() {
      try {
        const response = await fetch("/api/ref/kategori");
        const data = await response.json();
        console.log("Fetched kategori data:", data);
        if (Array.isArray(data)) {
          setKategoriOption(data);
        }
      } catch (error) {
        console.error("gagal fetch kategori");
      }
    }
    fetchKategori();
  }, []);

  return {
    wilayah,
    rumpunOptions,
    subRumpunOptions,
    kategoriOption,
  };
}
