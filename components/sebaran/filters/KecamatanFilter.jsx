"use client";

export default function KecamatanFilter({
  listKecamatan,
  selectedKab,
  selectedKec,
  onChange,
}) {
  const disabled = !selectedKab || listKecamatan.length === 0;

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold">Kecamatan</label>

      <select
        className="w-full p-2.5 rounded border border-slate-300 bg-white
                   focus:outline-none focus:ring-2 focus:ring-slate-500
                   disabled:bg-slate-200 disabled:text-slate-500"
        value={selectedKec}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">Semua Kecamatan</option>

        {listKecamatan.map((kec) => (
          <option key={kec} value={kec}>
            {kec}
          </option>
        ))}
      </select>

      {!selectedKab && (
        <p className="text-xs text-slate-600 italic">
          Pilih kabupaten terlebih dahulu.
        </p>
      )}
    </div>
  );
}
