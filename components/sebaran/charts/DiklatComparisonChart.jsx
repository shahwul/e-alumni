"use client";

import {
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { useAnalytics } from "@/hooks/useAnalytics";
import { useMemo, useState } from "react";

import { processData } from "../helpers/utils";
import { METRIC_OPTIONS } from "@/lib/constants";

import { CustomTooltipBarchart } from "../CustomTooltip";
import QuerySelector from "../QuerySelector";
import ChartCard from "../ChartCard";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Percent, Hash } from "lucide-react";

export default function DiklatComparisonChart({
  kab,
  kec,
  year,
  diklat = [],
  height = 400,
  onExpand,
}) {
  const [metric, setMetric] = useState("alumni");
  const [displayMode, setDisplayMode] = useState("quantity");
  console.log("DiklatComparisonChart props:", { kab, kec, year, diklat });
  const {
    data,
    loading,
    error,
  } = useAnalytics({
    metric,
    groupBy: "diklat",
    kab,
    kec,
    year,
    diklat, 
    caller: "BAR DIKLAT",
  });

  console.log("DiklatComparisonChart data:", data);
  const processedData = useMemo(() => processData(data), [data]);

  const total = useMemo(
    () => processedData.reduce((sum, item) => sum + item.value, 0),
    [processedData]
  );

  const combData = useMemo(() => {
    return processedData.map((item) => ({
      ...item,
      percentage:
        total > 0 ? (item.value / total) * 100 : 0,
    }));
  }, [processedData, total]);

  const isPercentage = displayMode === "percentage";
  const activeKey = isPercentage ? "percentage" : "value";

  const xAxisDomain = isPercentage
    ? [
        0,
        (max) => {
          const padded = max * 1.1;
          const capped = Math.min(padded, 100);
          return capped < 5 ? 5 : Math.ceil(capped);
        },
      ]
    : [0, (max) => Math.ceil(max * 1.1)];

  const xAxisTickFormatter = isPercentage
    ? (v) => `${v}%`
    : (v) => v.toLocaleString();

  if (loading) {
    return (
      <ChartCard height={height}>
        <div className="h-full flex items-center justify-center text-slate-400">
          Loading…
        </div>
      </ChartCard>
    );
  }

  if (error || combData.length === 0) {
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
      <div className="px-4 pt-4 pb-2 flex items-center justify-between gap-2 flex-wrap">
        <h5 className="text-sm font-semibold text-slate-600">
          Perbandingan{" "}
          {isPercentage ? "persentase" : "jumlah"}{" "}
          {METRIC_OPTIONS.find((o) => o.value === metric)?.label?.toLowerCase()}{" "}
          per diklat
        </h5>

        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={displayMode}
            onValueChange={(val) => val && setDisplayMode(val)}
            className="border border-slate-200 rounded-md p-0.5 bg-slate-50"
          >
            <ToggleGroupItem
              value="percentage"
              className="h-7 px-2 text-xs gap-1 data-[state=on]:bg-white data-[state=on]:shadow-sm"
            >
              <Percent className="h-3 w-3" />
              Persentase
            </ToggleGroupItem>
            <ToggleGroupItem
              value="quantity"
              className="h-7 px-2 text-xs gap-1 data-[state=on]:bg-white data-[state=on]:shadow-sm"
            >
              <Hash className="h-3 w-3" />
              Jumlah
            </ToggleGroupItem>
          </ToggleGroup>

          <QuerySelector
            label="Metric"
            value={metric}
            onChange={setMetric}
            options={METRIC_OPTIONS}
          />
        </div>
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
            domain={xAxisDomain}
            tickFormatter={xAxisTickFormatter}
          />

          <YAxis
            type="category"
            dataKey="name"
            interval={0}
            tick={{ fontSize: 12 }}
          />

          <Tooltip
            content={
              <CustomTooltipBarchart
                metric1={
                  METRIC_OPTIONS.find((o) => o.value === metric)?.label
                }
                displayMode={displayMode}
              />
            }
          />

          <Bar dataKey={activeKey}>
            {combData.map((entry, index) => (
              <Cell key={`diklat-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}