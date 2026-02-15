"use client";
import { useEffect, useState } from "react";

export function useDetailPTK(nik) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const res = await fetch(`/api/ptk/${nik}`);
        const json = await res.json();

        setData(json.data);
      } catch {
        console.error("Gagal fetch detail PTK", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  });
  return { loading, data };
}
