"use client";
import { useEffect, useState } from "react";

export function useDetailPTK(nik) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true); // Default true agar tidak flicker
  const [error, setError] = useState(null); // Tambahkan state error

  useEffect(() => {
    if (!nik) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/ptk/${nik}/details`);

        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Gagal fetch detail PTK", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [nik]);

  return { loading, data, error };
}
