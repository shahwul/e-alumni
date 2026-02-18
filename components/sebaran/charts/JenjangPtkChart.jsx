import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useMemo, useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { METRIC_OPTIONS } from "@/lib/constants";

import { processData, injectTotal } from "../helpers/utils";

import ChartCard from "../ChartCard";
import QuerySelector from "../QuerySelector";

export default function JenjangPtkChart({ kab, kec, year, diklat, height = 300, onExpand }) {
  const [metric, setMetric] = useState("alumni");

  const { data, loading } = useAnalytics({
    metric,
    groupBy: "jenjang",
    kab,
    kec,
    year,
    diklat,
       caller: "JENJANG CHART"
  });

  const processedData = useMemo(() => injectTotal(processData(data)), [data]);

  if (loading) {
    return (
      <ChartCard height={height} title="Jenjang Pendidikan">
        <div className="h-full flex items-center justify-center text-slate-400">
          Loading…
        </div>
      </ChartCard>
    );
  }

  if (!data.length) {
    return (
      <ChartCard height={height} title="Jenjang Pendidikan">
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
          Jenjang Pendidikan
        </h5>

        <QuerySelector
          label="Metric"
          value={metric}
          onChange={setMetric}
          options={METRIC_OPTIONS}
        />
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={processedData}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          />
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
