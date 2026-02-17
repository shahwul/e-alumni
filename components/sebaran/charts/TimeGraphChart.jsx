import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useAnalytics } from "@/hooks/useAnalytics";

import QuerySelector from "../QuerySelector";
import ChartCard from "../ChartCard";

import { GRAIN_OPTIONS } from "@/lib/constants";
import { useState } from "react";

export default function TimeGraphChart({
  kab,
  kec,
  year,
  diklat,
  height = 300,
  onExpand,
}) {
  const [ timeGrain, setTimeGrain ] = useState("year");
  const { data, loading, error } = useAnalytics({
    metric: "alumni",
    kab,
    kec,
    year,
    diklat,
    timeGrain,
  });

  // console.log(data);

  if (loading) {
    return (
      <ChartCard title="Tren Alumni" height={height} onExpand={onExpand}>
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
    <ChartCard height={height} onExpand={onExpand}>
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h5 className="text-sm font-semibold text-slate-600">
          Perbandingan Data PTK
        </h5>

        <QuerySelector
          label="Metric"
          value={timeGrain}
          onChange={setTimeGrain}
          options={GRAIN_OPTIONS}
        />
      </div>
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
