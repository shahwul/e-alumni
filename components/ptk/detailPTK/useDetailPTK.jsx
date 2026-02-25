"use client";
import { useEffect, useState, useCallback } from "react";

export function useDetailPTK(nik) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!nik) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ptk/${nik}/details`);
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Gagal fetch detail PTK", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [nik]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const syncData = async (npsn) => {
    if (!nik || !npsn) {
      console.error("NIK atau NPSN tidak tersedia");
      return;
    }

    setIsSyncing(true);
    try {
      const res = await fetch(`/api/sync/ptk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nik, npsn }),
      });

      if (!res.ok) throw new Error("Gagal menyinkronkan data dari pusat.");

      await fetchData();
      return { success: true };
    } catch (err) {
      console.error("Sync Error:", err);
      return { success: false, message: err.message };
    } finally {
      setIsSyncing(false);
    }
  };

  return { loading, data, error, isSyncing, syncData };
}

export function usePelatihanPTK(nik) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!nik) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/ptk/${nik}/pelatihan`);

        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Gagal fetch detail Pelatihan PTK", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [nik]);

  return { loading, data, error };
}
