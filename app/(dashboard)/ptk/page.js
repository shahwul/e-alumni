"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PTKHeader } from "@/components/ptk/list/PTKHeader";
import { PTKToolbar } from "@/components/ptk/list/PTKToolbar";
import { PTKTable } from "@/components/ptk/list/PTKTable";
import { PTKPagination } from "@/components/ptk/list/PTKPagination";
import { PTKSelectedActionsBar } from "@/components/ptk/list/PTKSelectedActionsBar";
import { usePTKList } from "@/components/ptk/list/usePTKList";
import { usePTKNavigation } from "@/components/ptk/list/hooks/usePTKNavigation";
import { AddToDiklatModal } from "@/components/ptk/AddToDiklatModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function PTKListContent() {
  const searchParams = useSearchParams();
  const [rowSelection, setRowSelection] = useState({});
  const [isAddToDiklatOpen, setIsAddToDiklatOpen] = useState(false);

  const {
    data, loading, totalData,
    page, limit, search, sorting, activeFilters, onExport, isSyncing,
    syncStatus, syncProgress, lastSync, onGlobalSync, onSyncKecamatan,
    alertConfig, handleAlertClose
  } = usePTKList(searchParams);

  const { setPage, setLimit, setSearch, setSorting, setActiveFilters } =
    usePTKNavigation(activeFilters);

  const isCandidateMode = activeFilters.mode_filter === "eligible";
  useEffect(() => setRowSelection({}), [isCandidateMode]);

  return (
    <div className="flex flex-col h-[calc(100vh-105px)] overflow-hidden space-y-4">

      <div className="flex-none space-y-4">
        <PTKHeader
          onExport={onExport}
          onGlobalSync={onGlobalSync}
          onSyncKecamatan={onSyncKecamatan}
          isSyncing={isSyncing}
          syncStatus={syncStatus}
          syncProgress={syncProgress}
          lastSync={lastSync}
          activeFilters={activeFilters}
        />
        <PTKToolbar
          search={search}
          setSearch={setSearch}
          sorting={sorting}
          setSorting={setSorting}
          onApplyFilter={setActiveFilters}
          activeFilters={activeFilters}
        />
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-xl border flex flex-col overflow-hidden shadow-sm">
        <PTKTable
          data={data} loading={loading}
          rowSelection={rowSelection} setRowSelection={setRowSelection}
          isCandidateMode={isCandidateMode} enableRowClick={isCandidateMode}
          sorting={sorting} setSorting={setSorting}
        />
        <PTKPagination
          page={page} limit={limit} totalData={totalData}
          setPage={setPage} setLimit={setLimit}
        />
      </div>

      <PTKSelectedActionsBar
        count={Object.keys(rowSelection).length}
        onClear={() => setRowSelection({})}
        onAction={() => setIsAddToDiklatOpen(true)}
      />

      <AddToDiklatModal
        isOpen={isAddToDiklatOpen}
        selectedNiks={Object.keys(rowSelection)}
        onClose={() => setIsAddToDiklatOpen(false)}
        onSuccess={() => setRowSelection({})}
      />

      <AlertDialog open={alertConfig.open} onOpenChange={handleAlertClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertConfig.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => handleAlertClose(false)} className="bg-blue-600 hover:bg-blue-700">OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function DataPTKPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Memuat Data PTK...
      </div>
    }>
      <PTKListContent />
    </Suspense>
  );
}