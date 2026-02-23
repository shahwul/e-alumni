"use client";

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

import { useMemo, useState } from "react";
import ChartCard from "../ChartCard";
import QuerySelector from "../QuerySelector";

const CHART_TYPES = [
  { label: "Vertical", value: "vertical" },
  { label: "Stacked Vertical", value: "stacked" },
  { label: "Horizontal", value: "horizontal" },
  { label: "Stacked Horizontal", value: "stacked-horizontal" },
];

export default function StackedChartComparison({ height = 400, onExpand }) {
  const [chartType, setChartType] = useState("vertical");

  // Dummy dataset
  const processedData = useMemo(
    () => [
      { name: "SD", alumni: 120, ptk: 80 },
      { name: "SMP", alumni: 98, ptk: 60 },
      { name: "SMA", alumni: 150, ptk: 110 },
      { name: "SMK", alumni: 75, ptk: 50 },
    ],
    []
  );

  const isHorizontal =
    chartType === "horizontal" || chartType === "stacked-horizontal";

  const isStacked =
    chartType === "stacked" || chartType === "stacked-horizontal";

  return (
    <ChartCard height={height} onExpand={onExpand}>
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h5 className="text-sm font-semibold text-slate-600">
          Recharts Bar Variants Demo
        </h5>

        <QuerySelector
          label="Chart Type"
          value={chartType}
          onChange={setChartType}
          options={CHART_TYPES}
        />
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={processedData}
          layout={isHorizontal ? "vertical" : "horizontal"}
        >
          <CartesianGrid strokeDasharray="3 3" />

          {isHorizontal ? (
            <>
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" />
            </>
          ) : (
            <>
              <XAxis dataKey="name" />
              <YAxis domain={[0, (max) => Math.ceil(max * 1.1)]} />
            </>
          )}

          <Tooltip />
          <Legend />

          {isStacked ? (
            <>
              <Bar dataKey="alumni" stackId="a" />
              <Bar dataKey="ptk" stackId="a" />
            </>
          ) : (
            <Bar dataKey="alumni" />
          )}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}