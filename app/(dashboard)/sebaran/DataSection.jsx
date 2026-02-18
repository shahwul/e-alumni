"use client";

import { useEffect, useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
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

import { KAB_CODE_TO_NAME } from "../../../lib/constants";
import {
  processData,
  injectTotal,
} from "../../../components/sebaran/helpers/utils";
import { CustomTooltip } from "../../../components/sebaran/CustomTooltip";
import ChartCard from "../../../components/sebaran/ChartCard";
import StatusKepegawaianChart from "@/components/sebaran/charts/StatusKepegawaianChart";
import PtkVsAlumniChart from "@/components/sebaran/charts/PtkVsAlumniChart";
import TabelViewData from "@/components/sebaran/charts/TabelViewData";
import TimeGraphChart from "@/components/sebaran/charts/TimeGraphChart";
import JenjangAlumniChart from "@/components/sebaran/charts/JenjangAlumniChart";

export default function DataSection({
  selectedKab,
  selectedKec,
  selectedYear,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedKab) params.append("kab", selectedKab);
        if (selectedKec) params.append("kec", selectedKec);
        if (selectedYear) params.append("year", selectedYear);

        const res = await fetch(`/api/dashboard/stats?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch data");
        setData(await res.json());
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching data:", error);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    console.log("Fetching data with params:", {
      selectedKab,
      selectedKec,
      selectedYear,
    });
    console.log("Data fetched:", data);
    return () => controller.abort();
  }, [selectedKab, selectedKec, selectedYear]);

  const statusData = useMemo(
    () => processData(data?.statusKepegawaian),
    [data],
  );
  const ptkAlumniData = useMemo(
    () => processData(data?.ptkVsAlumni, ["#82ca9d", "#8884d8"]),
    [data],
  );
  const kepsekData = useMemo(
    () => processData(data?.kepsekVsGuru, ["#8884d8", "#00C49F"]),
    [data],
  );
  const jabatanData = useMemo(() => processData(data?.jabatan), [data]);
  const triwulanData = useMemo(
    () =>
      data?.trenTriwulan?.map((d) => ({ ...d, alumni: Number(d.alumni) })) ||
      [],
    [data],
  );
  const tahunanData = useMemo(
    () =>
      data?.trenTahunan?.map((d) => ({ ...d, alumni: Number(d.alumni) })) || [],
    [data],
  );

  if (loading)
    return (
      <div className="flex-1 p-8 flex justify-center items-center text-slate-400">
        <Loader2 className="animate-spin mr-2" />
        Loading Data...
      </div>
    );
  if (!data)
    return (
      <div className="p-8 text-center text-slate-500">Data tidak tersedia.</div>
    );

  return (
    <div className="flex-1 bg-slate-50 rounded-xl border border-slate-300 p-4 overflow-y-auto min-h-0">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-800">
          {selectedKec
            ? `Infografis: Kec. ${selectedKec}`
            : selectedKab
              ? `Infografis: ${KAB_CODE_TO_NAME[selectedKab]}`
              : "Infografis: Provinsi D.I. Yogyakarta"}
        </h3>
        <p className="text-sm text-slate-500">
          Statistik PTK dan alumni{" "}
          {selectedYear ? (
            <>
              tahun <strong>{selectedYear}</strong>
            </>
          ) : (
            ""
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-4">
        {/* Tabel View */}
        <div className="lg:col-span-1 bg-white p-1.5 rounded-lg shadow-sm border border-slate-200 h-full flex flex-col">
          <h4 className="font-semibold text-slate-700 mb-4 mt-2 text-sm tracking-wide border-b pl-2 pb-2 ">
            Data Tersedia
          </h4>
          <TabelViewData
            kab={selectedKab}
            kec={selectedKec}
            year={selectedYear}
          />
        </div>

        {/* Chart Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard title="Jenjang Pendidikan" height={300}>
            <JenjangAlumniChart
              kab={selectedKab}
              kec={selectedKec}
              year={selectedYear}
            />
          </ChartCard>

          <ChartCard title="PTK vs Alumni" height={300}>
            <PtkVsAlumniChart
              kab={selectedKab}
              kec={selectedKec}
              year={selectedYear}
            />
          </ChartCard>

          {/* <div className="md:col-span-2">
            <ChartCard title="Persebaran Jabatan (Top 5)">
              {jabatanData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={jabatanData}
                    layout="vertical"
                    margin={{ left: 20, right: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={true}
                      vertical={false}
                    />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(val) =>
                        new Intl.NumberFormat("id-ID").format(val)
                      }
                    />
                    <Bar
                      dataKey="value"
                      fill="#3b82f6"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                      label={{
                        position: "right",
                        fill: "#666",
                        fontSize: 11,
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  Data Kosong
                </div>
              )}
            </ChartCard>
          </div> */}

          <ChartCard title={`Tren Alumni per Triwulan (${selectedYear})`}>
            {triwulanData.some((d) => d.alumni > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={triwulanData}
                  margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(val) =>
                      new Intl.NumberFormat("id-ID").format(val)
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="alumni"
                    stroke="#ff7300"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                Belum ada data tren
              </div>
            )}
          </ChartCard>

          <ChartCard title="Tren Alumni (5 Tahun Terakhir)" height={300}>
            <TimeGraphChart
              kab={selectedKab}
              kec={selectedKec}
              timeGrain="year"
              year={selectedYear}
            />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
