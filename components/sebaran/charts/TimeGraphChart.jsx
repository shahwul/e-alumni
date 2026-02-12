import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import { useAnalytics } from "@/hooks/useAnalytics";

import ChartCard from "../ChartCard";

export default function TimeGraphChart({kab,
  kec,
  year,
  timeGrain = "year", // "year" | "quarter" | "month"
  height = 300
}) {
  const { data, loading, error } = useAnalytics({
    metric: "alumni",
    kab,
    kec,
    year,
    timeGrain,
  });
  console.log("TimeGraphChart props:", { kab, kec, year, timeGrain });
  console.log("TimeGraphChart data:", data);

  if (loading) {
    return (
      <ChartCard title="Tren Alumni" height={height}>
      <div className="h-full flex items-center justify-center text-slate-400">
        Loading…
      </div>
      </ChartCard>
    );
  }

  if (error || data.length === 0) {
    return (
      <ChartCard title="Tren Alumni" height={height}>
      <div className="h-full flex items-center justify-center text-slate-400">
        Data Kosong
      </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Tren Alumni" height={height}>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
    </ChartCard>
  );
}