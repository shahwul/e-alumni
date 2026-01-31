"use client";

import { KAB_NAME_TO_CODE } from "../../../lib/constants";

export default function KabupatenFilter({
  wilayahData,
  selectedKab,
  loadingWilayah,
  onChange,
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold">Kabupaten / Kota</label>

      <select
        className="w-full p-2.5 rounded border border-slate-300 bg-white
                   focus:outline-none focus:ring-2 focus:ring-slate-500
                   disabled:bg-slate-100"
        value={selectedKab}
        onChange={(e) => onChange(e.target.value)}
        disabled={loadingWilayah}
      >
        <option value="">-- Semua Kabupaten --</option>

        {wilayahData.map((item) => {
          const code = KAB_NAME_TO_CODE[item.kabupaten];
          return (
            <option key={item.kabupaten} value={code || item.kabupaten}>
              {item.kabupaten}
            </option>
          );
        })}
      </select>
    </div>
  );
}
