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
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useAnalytics } from "@/hooks/useAnalytics";

const JENJANG_OPTIONS = [
  "PAUD",
  "TK",
  "SD",
  "SMP",
  "SMA",
  "Lainnya",
];

export default function TabelViewData({kab, kec, year}) {
  const [jenjang, setJenjang] = useState("");
  const [groupBy, setGroupBy] = useState("");

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
    metric: "alumni",
    kab,
    kec,
    year,
    groupBy,
    jenjang
  });

 return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-semibold text-sm text-left">{groupBy}</TableHead>
          <TableHead className="font-semibold text-sm text-right">Jumlah Alumni</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.map(row => (
          <TableRow key={row.name}>
            <TableCell className="max-w-[100px] whitespace-normal wrap-break-words text-sm text-left" title={row.name}>{row.name}</TableCell>
            <TableCell className="text-sm text-right">
              {row.value.toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
