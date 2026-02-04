import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { useAnalytics } from "@/hooks/useAnalytics";

const JENJANG_OPTIONS = [
  "PAUD",
  "TK",
  "SD",
  "SMP",
  "SMA",
  "Lainnya",
];

export default function TabelViewData({kab, kec, year}) {
  const [jenjang, setJenjang] = useState("");
  const [groupBy, setGroupBy] = useState("");

  useEffect(() => {
    if (!kab) {
      setGroupBy("kabupaten");
    } else if (kab && !kec) {
      setGroupBy("kecamatan");
    } else {
      setGroupBy("nama_sekolah"); 
    }
  }, [kab, kec]);

  console.log("Query Params:", { kab, kec, year, jenjang, groupBy });

  const { data, loading, error } = useAnalytics({
    metric: "alumni",
    kab,
    kec,
    year,
    groupBy,
    jenjang
  });

  return (
    <div className="space-y-2">
      <select
        value={jenjang}
        onChange={(e) => setJenjang(e.target.value)}
        className="border rounded p-1 text-sm"
      >
        <option value="">Semua Jenjang</option>
        {JENJANG_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ResponsiveContainer width="100%" height={300}>
        {loading ? (
          <div className="flex h-full items-center justify-center text-slate-400">
            Loading…
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-red-500">
            Error loading data
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-slate-400">
            Data Kosong
          </div>
        ) : (
          /* table or chart goes here */
          <pre className="text-xs overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </ResponsiveContainer>
    </div>
  );
}
