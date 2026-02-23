import { useState, useEffect } from "react";
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

export default function TabelViewData({ kab, kec, year, diklat }) {
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
    diklat,
    groupBy,
    jenjang,
    caller: "TABEL VIEW",
  });

  return (
    <div className="lg:col-span-1 bg-white p-1.5 rounded-lg shadow-sm border border-slate-200 max-h-[1445px] flex flex-col">
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
      <div className="flex-1 overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead className="font-semibold text-sm text-left">
                {groupBy}
              </TableHead>
              <TableHead className="font-semibold text-sm text-right text-wrap">
                Jumlah{" "}
                <span>
                  {METRIC_OPTIONS.find((opt) => opt.value === metric)?.label}
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((row) => (
              <TableRow key={row.name}>
                <TableCell
                  className="max-w-[100px] whitespace-normal break-words text-sm text-left"
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
    </div>
  );
}
