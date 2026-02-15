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

import { KAB_CODE_TO_NAME } from "../../lib/constants";
import {
  processData,
  injectTotal,
} from "../../components/sebaran/helpers/utils";
import { CustomTooltip } from "../../components/sebaran/CustomTooltip";
import ChartCard from "../../components/sebaran/ChartCard";
import PopupModal from "@/components/sebaran/PopupModal";

import StatusKepegawaianChart from "@/components/sebaran/charts/StatusKepegawaianChart";
import PtkVsAlumniChart from "@/components/sebaran/charts/PtkVsAlumniChart";
import TabelViewData from "@/components/sebaran/charts/TabelViewData";
import TimeGraphChart from "@/components/sebaran/charts/TimeGraphChart";
import JenjangPtkChart from "@/components/sebaran/charts/JenjangPtkChart";
import BarComparisonChart from "@/components/sebaran/charts/BarComparisonChart";

export default function DataSection({
  selectedKab,
  selectedKec,
  selectedYear,
}) {
  const [data, setData] = useState(null);
  const [activeChart, setActiveChart] = useState(null);
  const [loading, setLoading] = useState(true);

  const chartMap = {
    jenjang: (
      <JenjangPtkChart
        kab={selectedKab}
        kec={selectedKec}
        year={selectedYear}
        height={500}
      />
    ),
    ptkVsAlumni: (
      <PtkVsAlumniChart
        kab={selectedKab}
        kec={selectedKec}
        year={selectedYear}
        height={500}
      />
    ),
    barComparison: (
      <BarComparisonChart
        kab={selectedKab}
        kec={selectedKec}
        year={selectedYear}
        height={500}
      />
    ),
    timeGraph: (
      <TimeGraphChart
        kab={selectedKab}
        kec={selectedKec}
        year={selectedYear}
        timeGrain="year"
        height={500}
      />
    ),
  };

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
      <PopupModal
        isOpen={activeChart !== null}
        onClose={() => setActiveChart(null)}
      >
        {chartMap[activeChart] || null}
      </PopupModal>
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
        <TabelViewData
          kab={selectedKab}
          kec={selectedKec}
          year={selectedYear}
        />
        {/* Chart Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <JenjangPtkChart
            kab={selectedKab}
            kec={selectedKec}
            year={selectedYear}
            onExpand={() => setActiveChart("jenjang")}
          />

          <PtkVsAlumniChart
            kab={selectedKab}
            kec={selectedKec}
            year={selectedYear}
            onExpand={() => setActiveChart("ptkVsAlumni")}
          />

          <div className="md:col-span-2">
            <BarComparisonChart
              kab={selectedKab}
              kec={selectedKec}
              year={selectedYear}
              height={400}
              onExpand={() => setActiveChart("barComparison")}
            />
          </div>

          <div className="md:col-span-2">
            <TimeGraphChart
              kab={selectedKab}
              kec={selectedKec}
              timeGrain="year"
              year={selectedYear}
              onExpand={() => setActiveChart("timeGraph")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
