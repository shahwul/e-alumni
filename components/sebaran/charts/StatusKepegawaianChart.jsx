import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { useMemo } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { processData, injectTotal } from "../helpers/utils";

export default function StatusKepegawaianChart({ kab, kec, year }) {
  const { data, loading } = useAnalytics({
    metric: "ptk",
    groupBy: "status_kepegawaian",
    kab,
    kec
  });

  const processedData = useMemo(() => injectTotal(processData(data)), [data]);
  
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        Loading…
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        Data Kosong
      </div>
    );
  }

  return (
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
  );
}
