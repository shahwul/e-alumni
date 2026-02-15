import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useAnalytics } from "@/hooks/useAnalytics";
import { METRIC_OPTIONS } from "@/lib/constants";

import QuerySelector from "../QuerySelector";

export default function TabelViewData({ kab, kec, year }) {
  const [jenjang, setJenjang] = useState("");
  const [groupBy, setGroupBy] = useState("");
  const [metric, setMetric] = useState("alumni");

  useEffect(() => {
    if (!kab) {
      setGroupBy("Kabupaten");
    } else if (kab && !kec) {
      setGroupBy("Kecamatan");
    } else {
      setGroupBy("Sekolah");
    }
  }, [kab, kec]);

  const { data, loading, error } = useAnalytics({
    metric,
    kab,
    kec,
    year,
    groupBy,
    jenjang,
  });

  return (
    <div className="lg:col-span-1 bg-white p-1.5 rounded-lg shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h4 className="font-semibold text-slate-700 mb-4 mt-2 text-sm tracking-wide border-b pl-2 pb-2 ">
          Data Tersedia
        </h4>

        <QuerySelector
          label="Metric"
          value={metric}
          onChange={setMetric}
          options={METRIC_OPTIONS}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold text-sm text-left">
              {groupBy}
            </TableHead>
            <TableHead className="font-semibold text-sm text-right">
              Jumlah Alumni
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((row) => (
            <TableRow key={row.name}>
              <TableCell
                className="max-w-[100px] whitespace-normal wrap-break-words text-sm text-left"
                title={row.name}
              >
                {row.name}
              </TableCell>
              <TableCell className="text-sm text-right">
                {row.value.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
