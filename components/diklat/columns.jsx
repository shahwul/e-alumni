"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, CalendarDays, Monitor, MapPin } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const columns = (onViewPeserta) => [
  {
    accessorKey: "title",
    header: "Judul Diklat",
    cell: ({ row }) => (
        <div className="max-w-[300px]">
            <div className="font-semibold text-slate-800 line-clamp-2">{row.original.title}</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
               <span className="bg-slate-100 px-1.5 py-0.5 rounded border">{row.original.rumpun || "Umum"}</span>
               <span>{row.original.total_jp ? `${row.original.total_jp} JP` : '-'}</span>
            </div>
        </div>
    )
  },
  {
    accessorKey: "start_date",
    header: "Pelaksanaan",
    cell: ({ row }) => {
        const start = row.original.start_date ? new Date(row.original.start_date) : null;
        const end = row.original.end_date ? new Date(row.original.end_date) : null;
        return (
            <div className="text-sm text-slate-600 space-y-1">
                <div className="flex items-center gap-2">
                    <CalendarDays size={14} className="text-blue-500" />
                    <span>{start ? format(start, "dd MMM yyyy", {locale:id}) : "-"}</span>
                </div>
                {end && (
                    <div className="text-xs text-slate-400 ml-6">
                        s.d {format(end, "dd MMM yyyy", {locale:id})}
                    </div>
                )}
            </div>
        )
    }
  },
  {
    accessorKey: "moda",
    header: "Moda",
    cell: ({ row }) => {
        const moda = row.original.moda || "Luring";
        return (
            <Badge variant="outline" className={
                moda.includes("Daring") ? "bg-purple-50 text-purple-700 border-purple-200" :
                moda.includes("Hybrid") ? "bg-orange-50 text-orange-700 border-orange-200" :
                "bg-green-50 text-green-700 border-green-200"
            }>
                {moda.includes("Daring") ? <Monitor size={12} className="mr-1"/> : <MapPin size={12} className="mr-1"/>}
                {moda}
            </Badge>
        )
    }
  },
  {
    accessorKey: "total_peserta",
    header: "Peserta",
    cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-400" />
            <span className="font-bold text-slate-700">{row.original.total_peserta}</span>
        </div>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => onViewPeserta(row.original)}
        >
            Lihat Peserta
        </Button>
      )
    },
  },
];