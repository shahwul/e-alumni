import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useMemo, useState } from "react";

import { processData, injectTotal } from "../helpers/utils";
import { METRIC_OPTIONS } from "@/lib/constants";

import QuerySelector from "../QuerySelector";
import ChartCard from "../ChartCard";

export default function BarComparisonChart({ kab, kec, year, diklat, height = 400,  onExpand }) {
  const [metric, setMetric] = useState("alumni");

  const groupBy = useMemo(() => {
    if (!kab) return "kabupaten";
    if (kab && !kec) return "kecamatan";
    return "jenjang";
  }, [kab, kec]);

  const { data, loading, error } = useAnalytics({
    metric,
    groupBy,
    kab,
    kec,
    year,
    diklat,
    caller: "BAR CHART"
  });

  const processedData = useMemo(() => injectTotal(processData(data)), [data]);

  if (loading) {
    return (
      <ChartCard height={height}>
        <div className="h-full flex items-center justify-center text-slate-400">
          Loading…
        </div>
      </ChartCard>
    );
  }

  if (error || data.length === 0) {
    return (
      <ChartCard height={height}>
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
          value={metric}
          onChange={setMetric}
          options={METRIC_OPTIONS}
        />
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, (max) => Math.ceil(max * 1.1)]} />
          <Tooltip />
          <Bar dataKey="value" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
