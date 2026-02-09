import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { useMemo } from "react";

export function PTKTable({ data, loading, rowSelection, setRowSelection, sorting, setSorting, isCandidateMode }) {
  const filteredColumns = useMemo(() => {
    if (isCandidateMode) {
        return columns; // Tampilkan semua (termasuk checkbox)
    } else {
        // Hapus kolom dengan id 'select' (asumsi id checkbox di columns.js adalah 'select')
        return columns.filter(col => col.id !== 'select');
    }
  }, [isCandidateMode]);

  if (loading) {
    return <div className="p-12 text-center text-slate-500 bg-slate-50/50 rounded-lg animate-pulse">Sedang memuat data...</div>;
  }
  return (
    <div className="relative max-h-[60vh] w-full overflow-auto">
      {loading ? (
        // Skeleton Loader Sederhana
        <div className="p-8 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 bg-slate-50 animate-pulse rounded-md w-full"
            />
          ))}
        </div>
      ) : (
        <DataTable columns={filteredColumns} data={data} rowSelection={rowSelection} setRowSelection={setRowSelection} sorting={sorting} onSortingChange={setSorting} />
      )}
    </div>
  );
}
