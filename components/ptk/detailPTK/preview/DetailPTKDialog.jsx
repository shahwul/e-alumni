"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  GraduationCap,
  User,
  Hash,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { usePelatihanPTK } from "../useDetailPTK";

export function DetailPTKDialog({ open, onOpenChange, nik }) {
  const { data, loading, error } = usePelatihanPTK(open ? nik : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl bg-white p-0 overflow-hidden border-none shadow-2xl">
        {/* Header Sederhana */}
        <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <User className="h-3 w-3" /> Informasi Personal
              </div>
              <DialogTitle className="text-2xl font-black text-slate-900 uppercase">
                {loading
                  ? "Memuat..."
                  : data?.ptk?.nama_ptk || "Data Tidak Ditemukan"}
              </DialogTitle>
            </div>

            <div className="flex items-center gap-3 mr-6 bg-white p-3 rounded-xl border border-slate-200 shadow-sm self-start">
              <Hash className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">
                  NPSN Unit Kerja
                </p>
                <p className="text-sm font-mono font-bold text-slate-700 leading-none">
                  {data?.ptk?.npsn || "-"}
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-6 text-slate-800">
            <div className="p-2 bg-slate-100 rounded-lg">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h4 className="font-bold tracking-tight text-lg">
              RIWAYAT PELATIHAN
            </h4>
          </div>

          {/* Kondisi Error */}
          {error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-red-50/50 rounded-xl border border-dashed border-red-200">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p className="font-semibold text-sm">Gagal memuat data</p>
              <p className="text-xs text-red-400">{error}</p>
            </div>
          ) : loading ? (
            /* Kondisi Loading */
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
              <div className="animate-spin h-6 w-6 border-2 border-slate-300 border-t-slate-800 rounded-full" />
              <p className="text-xs font-bold uppercase tracking-widest">
                Sinkronisasi Data...
              </p>
            </div>
          ) : (
            /* Tampilan Data */
            <ScrollArea className="h-[400px] w-full rounded-xl border border-slate-200 bg-white">
              <Table>
                <TableHeader className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                  <TableRow>
                    <TableHead className="w-[350px] font-bold text-slate-700">
                      Nama Pelatihan
                    </TableHead>
                    <TableHead className="font-bold text-slate-700">
                      Waktu & JP
                    </TableHead>
                    <TableHead className="font-bold text-slate-700">
                      Lokasi / Mode
                    </TableHead>
                    <TableHead className="text-right font-bold text-slate-700">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!data?.riwayatPelatihan ||
                  data.riwayatPelatihan.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-16 text-slate-400"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-slate-300" />
                          <p className="italic text-sm font-medium">
                            Belum ada riwayat pelatihan terdaftar.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.riwayatPelatihan.map((item) => (
                      <TableRow
                        key={item.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <TableCell>
                          <div className="font-bold text-slate-800 leading-tight">
                            {item.judul_diklat}
                          </div>
                          <div className="inline-block bg-slate-100 text-[9px] text-slate-500 font-mono mt-1.5 px-1.5 py-0.5 rounded border border-slate-200">
                            ID: {item.course_code}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              {item.start_date
                                ? format(
                                    new Date(item.start_date),
                                    "dd MMM yyyy",
                                    { locale: id },
                                  )
                                : "-"}
                            </div>
                            <Badge
                              variant="outline"
                              className="w-fit text-[10px] font-bold py-0 h-5 border-slate-300"
                            >
                              {item.total_jp} JP
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 max-w-[150px] truncate">
                              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              {item.location}
                            </div>
                            <div className="flex gap-1 mt-1">
                              <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 rounded capitalize">
                                {item.mode_name}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            className={`text-[10px] uppercase font-black px-2.5 py-1 shadow-none border transition-all ${
                              item.status_kelulusan === "Lulus"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-orange-50 text-orange-700 border-orange-200"
                            }`}
                          >
                            {item.status_kelulusan === "Lulus" ? (
                              <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                            ) : (
                              <Clock className="h-3 w-3 mr-1 inline" />
                            )}
                            {item.status_kelulusan}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
