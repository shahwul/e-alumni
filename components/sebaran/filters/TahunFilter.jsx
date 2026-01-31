"use client";

import { CalendarRange } from "lucide-react";
import { YEAR_LIST } from "../../../lib/constants";

export default function TahunFilter({ selectedYear, onChange }) {
  return (
    <div className="space-y-2 border-t pt-4">
      <div className="flex items-center gap-2 mb-1">
        <CalendarRange className="w-4 h-4 text-slate-500" />
        <label className="text-sm font-semibold">Periode Tahun</label>
      </div>

      <select
        className="w-full p-2.5 rounded border border-slate-300 bg-white
                   focus:outline-none focus:ring-2 focus:ring-slate-500"
        value={selectedYear}
        onChange={(e) => onChange(e.target.value)}
      >
        {YEAR_LIST.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}
