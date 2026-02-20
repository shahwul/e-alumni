"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, CalendarDays, Monitor, MapPin, ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

const sortableHeader = (column, title, icon = null) => {
  const isSorted = column.getIsSorted();
  const sortIndex = column.getSortIndex();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "-ml-3 h-8 font-semibold transition-all duration-200 group",
        isSorted
          ? "text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 border border-blue-100"
          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
      )}
      onClick={(e) => {
        column.toggleSorting(column.getIsSorted() === "asc", !!e.shiftKey);
      }}
    >
      {icon ? icon : <span>{title}</span>}

      {isSorted === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4 text-blue-600 shrink-0" />
      ) : isSorted === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4 text-blue-600 shrink-0" />
      ) : (
        <ChevronsUpDown className="ml-2 h-4 w-4 text-slate-400 opacity-50 group-hover:opacity-100 shrink-0" />
      )}

      {isSorted && sortIndex > -1 && (
        <span className="ml-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white shadow-sm animate-in zoom-in-50 duration-200">
          {sortIndex + 1}
        </span>
      )}
    </Button>
  );
};

export const columns = (onViewPeserta) => [
  {
    accessorKey: "title",
    header: ({ column }) => sortableHeader(column, "Judul Diklat"),
    meta: {
      className: "min-w-[280px] sm:w-[450px] pl-4",
    },
    cell: ({ row }) => (
        <div className="py-1">
            <div className="font-semibold text-slate-800 line-clamp-2 leading-relaxed">
              {row.original.title}
            </div>
            <div className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-2">
               <span className="bg-slate-100 px-1.5 py-0.5 rounded border font-medium text-slate-600">
                {row.original.topic_name || "Umum"}
               </span>
               <span className="flex items-center gap-1">
                 {row.original.total_jp ? `${row.original.total_jp} JP` : '-'}
               </span>
            </div>
        </div>
    )
  },
  {
    accessorKey: "start_date",
    header: ({ column }) => sortableHeader(column, "Tanggal"),
    meta: {
      className: "min-w-[160px]",
    },
    cell: ({ row }) => {
        const start = row.original.start_date ? new Date(row.original.start_date) : null;
        const end = row.original.end_date ? new Date(row.original.end_date) : null;
        return (
            <div className="text-sm text-slate-600 space-y-1 py-1">
                <div className="flex items-center gap-2">
                    <CalendarDays size={14} className="text-blue-500 shrink-0" />
                    <span className="whitespace-nowrap font-medium">
                      {start ? format(start, "dd MMM yyyy", {locale:id}) : "-"}
                    </span>
                </div>
                {end && (
                    <div className="text-[11px] text-slate-400 ml-6">
                        s.d {format(end, "dd MMM yyyy", {locale:id})}
                    </div>
                )}
            </div>
        )
    }
  },
  {
    accessorKey: "moda",
    header: ({ column }) => sortableHeader(column, "Moda"),
    meta: {
      className: "min-w-[120px]",
    },
    cell: ({ row }) => {
        const moda = row.original.moda || "Luring";
        return (
            <Badge variant="outline" className={cn(
                "font-medium shadow-sm transition-all",
                moda.includes("Daring") ? "bg-purple-50 text-purple-700 border-purple-200" :
                moda.includes("Hybrid") ? "bg-orange-50 text-orange-700 border-orange-200" :
                "bg-green-50 text-green-700 border-green-200"
            )}>
                {moda.includes("Daring") ? <Monitor size={12} className="mr-1.5"/> : <MapPin size={12} className="mr-1.5"/>}
                {moda}
            </Badge>
        )
    }
  },
  {
    accessorKey: "total_peserta",
    header: ({ column }) => sortableHeader(column, "Peserta"),
    meta: {
      className: "min-w-[100px] text-center",
    },
    cell: ({ row }) => (
        <div className="flex items-center gap-2 pl-6">
            <Users size={16} className="text-slate-400 shrink-0" />
            <span className="font-bold text-slate-700">{row.original.total_peserta}</span>
        </div>
    )
  },
  {
    id: "actions",
    meta: {
      className: "text-right pr-4", 
    },
    cell: ({ row }) => {
      return (
        <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold"
            onClick={() => onViewPeserta(row.original)}
        >
            Lihat Peserta
        </Button>
      )
    },
  },
];