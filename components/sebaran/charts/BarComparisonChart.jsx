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
  Label,
} from "recharts";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useMemo, useState } from "react";

import { processData, injectTotal } from "../helpers/utils";
import { METRIC_OPTIONS } from "@/lib/constants";

import { CustomTooltipBarchart } from "../CustomTooltip";
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

      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={combData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            type="number"
            domain={[
              0,
              (max) => {
                const padded = max * 1.1;
                return padded > 100 ? 100 : padded < 5 ? 5 : Math.ceil(padded);
              },
            ]}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            interval={0}
            tick={({ x, y, payload }) => (
              <text
                x={x}
                y={y}
                dy={4}
                textAnchor="end"
                fill="#64748b"
                fontSize={12}
              >
                {payload.value}
              </text>
            )}
          />

          <Tooltip
            content={
              <CustomTooltipBarchart
                metric1={
                  METRIC_OPTIONS.find((option) => option.value === metric1)
                    ?.label || "Unknown"
                }
                metric2={
                  METRIC_OPTIONS.find((option) => option.value === metric2)
                    ?.label || "Unknown"
                }
              />
            }
          />
          <Bar dataKey="percentage">
            {combData.map((entry, index) => (
              <Cell key={`m1-${index}`} fill={entry.fill} />
            ))}
          </Bar>

          {/* <Bar dataKey={metric2} fill="#82ca9d" /> */}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
