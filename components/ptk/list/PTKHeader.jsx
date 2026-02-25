"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  RefreshCw, 
  Loader2, 
  Clock, 
  MapPin, 
  AlertCircle, 
  AlertTriangle 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function PTKHeader({ 
  onExport, 
  onGlobalSync, 
  onSyncKecamatan,
  isSyncing, 
  syncStatus, 
  syncProgress, 
  lastSync,
  activeFilters 
}) {
  const selectedKecCount = activeFilters?.kecamatan?.length || 0;
  const isValidDate = (dateString) => {
    if (!dateString || dateString === "RUNNING" || dateString === "NEVER") return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Data Pendidik & Tenaga Kependidikan
        </h2>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-slate-500 text-sm">
            Kelola data guru, pantau status pelatihan, dan riwayat diklat.
          </p>

          {/* STATUS BADGE LOGIC */}
          {!isSyncing && (
            <>
              {lastSync && isValidDate(lastSync) ? (
                // Skenario 1: Sukses Terakhir
                <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border">
                  <Clock size={12} className="text-blue-400" />
                  Last Sync: {new Date(lastSync).toLocaleString("id-ID", { 
                    day: '2-digit', 
                    month: 'short', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              ) : lastSync && lastSync !== "RUNNING" ? (
                // Skenario 2: Terdeteksi Pesan Error di Kolom Value
                <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                  <AlertCircle size={12} />
                  Sinkronisasi terakhir gagal
                </span>
              ) : (
                // Skenario 3: Belum pernah sync (null/NEVER)
                <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  <AlertTriangle size={12} />
                  Data perlu disinkronkan
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* BUTTON SYNC WILAYAH (ORANGE) */}
        {selectedKecCount > 0 && (
          <Button
            variant="outline"
            onClick={onSyncKecamatan}
            disabled={isSyncing}
            className="border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100 hover:text-orange-800 transition-colors gap-2"
          >
            {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
            {isSyncing ? `Menyinkronkan...` : `Sinkronkan ${selectedKecCount} Wilayah`}
          </Button>
        )}

        {/* POPOVER SYNC GLOBAL (BIRU) */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant={isSyncing ? "secondary" : "outline"} 
              className={`gap-2 ${isSyncing ? "text-blue-600 border-blue-200" : ""}`}
              disabled={isSyncing}
            >
              {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {isSyncing ? `Menyinkronkan... ${syncProgress}%` : "Sinkronkan Semua DIY"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Sinkronisasi Global</h4>
                <p className="text-xs text-slate-500 italic">
                  Menarik 70rb+ data sekolah & PTK. Proses ini memakan waktu lama dan disarankan dilakukan saat server pusat stabil.
                </p>
              </div>
              
              {!isSyncing ? (
                <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm" onClick={onGlobalSync}>
                  Mulai Sinkronisasi
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-500" 
                      style={{ width: `${syncProgress}%` }}
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <Loader2 size={12} className="animate-spin text-blue-600 mt-0.5" />
                    <p className="text-[10px] text-slate-600 font-mono leading-tight">
                      {syncStatus}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* DROPDOWN EXPORT */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 border-slate-200">
              <Download size={16} /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onExport("eligible")}>Export Kandidat</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport("history")}>Export Arsip</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}