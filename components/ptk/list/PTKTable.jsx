import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { useMemo } from "react";

export function PTKTable({ data, loading, rowSelection, setRowSelection, sorting, setSorting, isCandidateMode, enableRowClick }) {
  const filteredColumns = useMemo(() => {
    if (isCandidateMode) {
      return columns;
    } else {
      return columns.filter(col => col.id !== 'select');
    }
  }, [isCandidateMode]);

  return (
    <div className="flex-1 min-h-0 w-full overflow-auto relative">
      {/* Overlay Loading: Muncul di atas tabel tanpa menghilangkan tabelnya */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[1px] transition-all">
          <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-lg border border-slate-100">
            <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
              Memperbarui...
            </span>
          </div>
        </div>
      )}

      {/* Tabel tetap dirender, hanya opasitasnya dikurangi saat loading */}
      <div className={loading ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
        <DataTable 
          columns={filteredColumns} 
          data={data} 
          rowSelection={rowSelection} 
          setRowSelection={setRowSelection} 
          sorting={sorting} 
          onSortingChange={setSorting} 
          enableRowClick={enableRowClick} 
        />
      </div>
    </div>
  );
}
