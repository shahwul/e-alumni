"use client";

import { PTKHeader } from "@/components/ptk/list/PTKHeader";
import { PTKToolbar } from "@/components/ptk/list/PTKToolbar";
import { PTKTable } from "@/components/ptk/list/PTKTable";
import { PTKPagination } from "@/components/ptk/list/PTKPagination";
import { usePTKList } from "@/components/ptk/list/usePTKList";

export default function DataPTKPage() {
  const {
    data,
    loading,
    page,
    limit,
    totalData,
    search,
    sorting,
    activeFilters,

    setPage,
    setLimit,
    setSearch,
    setSorting,
    setActiveFilters,

    onExport,
  } = usePTKList();

  return (
    <div className="space-y-6">
      <PTKHeader onExport={onExport} />
      <PTKToolbar
        search={search}
        setSearch={setSearch}
        sorting={sorting}
        setSorting={setSorting}
        onApplyFilter={setActiveFilters}
      />
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">
        <PTKTable data={data} loading={loading} />
        <PTKPagination
          page={page}
          limit={limit}
          totalData={totalData}
          setPage={setPage}
          setLimit={setLimit}
        />
      </div>
    </div>
  );
}
