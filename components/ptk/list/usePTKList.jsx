"use client";

import { useState, useEffect, useCallback } from "react";
import { buildPTKParams } from "./buildPTKParams";

export function usePTKList(searchParams) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalData, setTotalData] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSync, setLastSync] = useState(null);

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 25;
  const search = searchParams.get("search") || "";
  const sortParam = searchParams.get("sort");

  const reverseSortMapping = {
    nama: "nama_ptk",
    sekolah: "nama_sekolah",
    usia: "usia_tahun",
    status: "status_kepegawaian",
  };

  const sorting = sortParam
    ? sortParam.split(",").map((item) => {
        const [field, dir] = item.split(":");
        return {
          id: reverseSortMapping[field] || field,
          desc: dir === "desc",
        };
      })
    : [{ id: "nama_ptk", desc: false }];

  // Mapping Active Filters
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

  const fetchData = useCallback(async () => {
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
      if (!res.ok) throw new Error("Gagal memuat data tabel");
      const json = await res.json();

      const mappedData = (json.data || []).map((item) => ({
        ...item,
        mapel: item.riwayat_sertifikasi_bidang_studi,
      }));

      setData(mappedData);
      setTotalData(json.meta?.totalData || 0);
    } catch (err) {
      console.error("❌ Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, JSON.stringify(sorting), JSON.stringify(activeFilters)]);

  const fetchMetadata = useCallback(async () => {
    try {
      const res = await fetch("/api/sync/metadata");
      const json = await res.json();
      if (json.value && !json.value.includes("ERROR") && json.value !== "RUNNING") {
        setLastSync(json.value);
      }
    } catch (err) {
      console.error("⚠️ Metadata load failed");
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchMetadata();
  }, [fetchData, fetchMetadata]);

  const handleGlobalSync = () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setSyncProgress(0);
    setSyncStatus("Memulai Turbo Sync...");

    const eventSource = new EventSource("/api/sync/global");

    eventSource.onmessage = (event) => {
      const res = JSON.parse(event.data);
      
      if (res.message) setSyncStatus(res.message);
      if (res.progress !== undefined) setSyncProgress(res.progress);

      if (res.done) {
        setLastSync(res.last_sync || new Date().toISOString());
        setIsSyncing(false);
        setSyncStatus("Sinkronisasi Selesai!");
        eventSource.close();
        fetchData();
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Error:", err);
      setSyncStatus("Koneksi terputus. Cek logs database.");
      setIsSyncing(false);
      eventSource.close();
    };
  };

  const handleSyncKecamatan = async () => {
    const selectedKecNames = activeFilters.kecamatan;
    if (!selectedKecNames.length) return;

    setIsSyncing(true);
    setSyncStatus("Mencari kode wilayah...");

    try {
      const resMap = await fetch(`/api/wilayah/map-kecamatan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names: selectedKecNames })
      });
      const { codes } = await resMap.json();

      if (!codes || codes.length === 0) {
        throw new Error("Kode kecamatan tidak ditemukan di database lokal.");
      }

      const queryParams = new URLSearchParams();
      codes.forEach(code => queryParams.append('kode_kecamatan', code));

      const eventSource = new EventSource(`/api/sync/kecamatan?${queryParams.toString()}`);

      eventSource.onmessage = (event) => {
        const res = JSON.parse(event.data);
        if (res.message) setSyncStatus(res.message);
        if (res.progress !== undefined) setSyncProgress(res.progress);
        if (res.done) {
          eventSource.close();
          setIsSyncing(false);
          fetchData();
        }
      };

      eventSource.onerror = () => {
        setIsSyncing(false);
        eventSource.close();
      };

    } catch (err) {
      alert(err.message);
      setIsSyncing(false);
    }
  };

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
    isSyncing,
    syncStatus,
    syncProgress,
    lastSync,
    onGlobalSync: handleGlobalSync,
    onSyncKecamatan: handleSyncKecamatan,
    onExport: handleExport,
  };
}