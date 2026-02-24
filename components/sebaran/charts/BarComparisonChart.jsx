import {
  Cell,
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
  const [metric2, setMetric2] = useState("ptk");

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

  const processedData1 = useMemo(
    () => injectTotal(processData(dataMetric1)),
    [dataMetric1],
  );
  const processedData2 = useMemo(
    () => injectTotal(processData(dataMetric2)),
    [dataMetric2],
  );

  const combData = useMemo(() => {
    const map = new Map();

    processedData1.forEach((item) => {
      map.set(item.name, {
        name: item.name,
        fill: item.fill,
        totalCount: item.totalCount,
        metric1Value: item.value,
        metric2Value: 0,
      });
    });

    processedData2.forEach((item) => {
      if (map.has(item.name)) {
        map.get(item.name).metric2Value = item.value;
      } else {
        map.set(item.name, {
          name: item.name,
          fill: item.fill,
          totalCount: item.totalCount,
          metric1Value: 0,
          metric2Value: item.value,
        });
      }
    });

    return Array.from(map.values()).map((item) => ({
      ...item,
      percentage:
        item.metric2Value > 0
          ? (item.metric1Value / item.metric2Value) * 100
          : 0,
    }));
  }, [processedData1, processedData2]);

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

      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={combData}
          layout="vertical" // <-- important
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            type="number"
            domain={[
              0,
              (max) => {
                const padded = max * 1.1;
                return padded < 5 ? 5 : Math.ceil(padded);
              },
            ]}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis type="category" dataKey="name" />

          <Tooltip />
          <Bar dataKey="percentage">
            {combData.map((entry, index) => (
              <Cell key={`m1-${index}`} fill={entry.fill} />
            ))}
          </Bar>

          <Bar dataKey={metric2} fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
