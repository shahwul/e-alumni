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

export default function BarComparisonChart({
  kab,
  kec,
  year,
  diklat,
  height = 400,
  onExpand,
}) {
  const [metric1, setMetric1] = useState("alumni");
  const [metric2, setMetric2] = useState("untrained");

  const groupBy = useMemo(() => {
    if (!kab) return "kabupaten";
    if (kab && !kec) return "kecamatan";
    return "jenjang";
  }, [kab, kec]);

  const {
    data: dataMetric1,
    loading: loadingMetric1,
    error: errorMetric1,
  } = useAnalytics({
    metric: metric1,
    groupBy,
    kab,
    kec,
    year,
    diklat,
    caller: "BAR CHART",
  });

  const {
    data: dataMetric2,
    loading: loadingMetric2,
    error: errorMetric2,
  } = useAnalytics({
    metric: metric2,
    groupBy,
    kab,
    kec,
    year,
    diklat,
    caller: "BAR CHART",
  });

  console.log("RAW  1", dataMetric1);

  const processedData1 = useMemo(
    () => injectTotal(processData(dataMetric1)),
    [dataMetric1],
  );
  const processedData2 = useMemo(
    () => injectTotal(processData(dataMetric2)),
    [dataMetric2],
  );

  console.log("COOKED 1", processedData1);

  if (loadingMetric1 || loadingMetric2) {
    return (
      <ChartCard height={height}>
        <div className="h-full flex items-center justify-center text-slate-400">
          Loading…
        </div>
      </ChartCard>
    );
  }

  if (
    errorMetric1 ||
    errorMetric2 ||
    dataMetric1.length === 0 ||
    dataMetric2.length === 0
  ) {
    return (
      <ChartCard height={height}>
        <div className="h-full flex items-center justify-center text-slate-400">
          Data Kosong {errorMetric1} {errorMetric2}
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
          value={metric1}
          onChange={setMetric1}
          options={METRIC_OPTIONS}
        />
      </div>

      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={processedData1}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis type="number" domain={[0, (max) => Math.ceil(max * 1.1)]} />
          <YAxis type="category" dataKey="name" />

          <Tooltip />
          <Bar dataKey="value" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
