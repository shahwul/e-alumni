import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useMemo, useState } from "react";

import { useAnalytics } from "@/hooks/useAnalytics";
import { processData, injectTotal } from "../helpers/utils";
import { METRIC_OPTIONS } from "@/lib/constants";

import { CustomTooltip }  from "../CustomTooltip";
import ChartCard from "../ChartCard";
import QuerySelector from "../QuerySelector";

export default function PtkVsAlumniChart({ kab, kec, year, height = 300 }) {
  const [ metric1, setMetric1 ] = useState("ptk");
  const [ metric2, setMetric2 ] = useState("alumni");

  const alumni = useAnalytics({
    metric: metric2,
    kab,
    kec,
    year,
  });

  const untrained = useAnalytics({
    metric: metric1,
    kab,
    kec,
    year,
  });

  const loading = alumni.loading || untrained.loading;

  //Man what the hell is this, i hate javascript (I hate myself for making this)
  const data = useMemo(
    () =>
      injectTotal(
        processData(
          !loading && alumni.data.length && untrained.data.length
            ? [
                { name: "Alumni", value: alumni.data[0].value },
                { name: "Belum Pelatihan", value: untrained.data[0].value },
              ]
            : [],
          ["#82ca9d", "#8884d8"],
        ),
      ),
    [loading, alumni.data, untrained.data], // Updated dependencies
  );


  if (loading) {
    return (
      <ChartCard title="PTK vs Alumni" height={height}>
        <div className="h-full flex items-center justify-center text-slate-400">
          Loading…
        </div>
      </ChartCard>
    );
  }

  if (!data.length || data.every((item) => item.value === 0)) {
    return (
      <ChartCard title="PTK vs Alumni" height={height}>
        <div className="h-full flex items-center justify-center text-slate-400">
          Data Kosong
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="PTK vs Alumni" height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={0}
            outerRadius={80}
            dataKey="value"
            nameKey="name"
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
