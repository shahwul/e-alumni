"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; 
import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

import { ActionCell } from "./cells/ActionCell";
import { CopyButton } from "./cells/Copybutton";

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

export const columns = [
  // 1. SELECT (CHECKBOX)
  {
    id: "select",
    meta: {
      className: "w-[50px] text-center",
    },
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // 2. NAMA PTK (SORTABLE)
  {
    accessorKey: "nama_ptk",
    meta: {
      className: "min-w-[280px] sm:w-[350px] pl-4", 
    },
    header: ({ column }) => sortableHeader(column, "Nama PTK"),
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-bold text-slate-900 text-sm">
          {row.getValue("nama_ptk")}
        </span>
        <div className="flex items-center text-[10px] text-slate-500 gap-1">
          <span className="font-mono bg-slate-100 px-1 rounded">
            {row.original.nik}
          </span>
          <CopyButton row={row} />
        </div>
      </div>
    ),
  },

  // 3. UNIT KERJA (SORTABLE)
  {
    accessorKey: "nama_sekolah",
    meta: {
      className: "min-w-[200px]",
    },
    header: ({ column }) => sortableHeader(column, "Unit Kerja"),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-slate-700">
          {row.getValue("nama_sekolah")}
        </span>
        <span className="text-[11px] text-slate-500">
          {row.original.kabupaten}
        </span>
      </div>
    ),
  },

  // 4. MATA PELAJARAN (SORTABLE)
  {
    accessorKey: "mapel",
    meta: {
      className: "w-[150px]",
    },
    header: ({ column }) => sortableHeader(column, "Mata Pelajaran"),
    cell: ({ row }) => (
      <div
        className="text-xs text-slate-600 max-w-[150px] truncate"
        title={row.getValue("mapel")}
      >
        {row.getValue("mapel") || "-"}
      </div>
    ),
  },

  // 5. USIA (SORTABLE)
  {
    accessorKey: "usia_tahun",
    header: ({ column }) => sortableHeader(column, "Usia"),
    cell: ({ row }) => (
      <div className="text-xs font-medium text-slate-600 pl-2">
        {row.getValue("usia_tahun")
          ? `${row.getValue("usia_tahun")} Thn`
          : "-"}
      </div>
    ),
  },

  // 6. PELATIHAN (SORTABLE)
  {
    accessorKey: "is_sudah_pelatihan",
    header: ({ column }) => sortableHeader(column, "Status"),
    cell: ({ row }) => {
      const isSudah = row.getValue("is_sudah_pelatihan");
      return (
        <Badge
          variant={isSudah ? "default" : "secondary"}
          className={
            isSudah
              ? "bg-green-600 hover:bg-green-700 font-normal"
              : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 font-normal"
          }
        >
          {isSudah ? "Sudah Dilatih" : "Belum"}
        </Badge>
      );
    },
  },

  {
    accessorKey: "jumlah_diklat",
    meta: {
      className: "w-[60px] text-center",
    },
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      const sortIndex = column.getSortIndex();

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center w-full">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 relative group", 
                    isSorted
                      ? "bg-blue-50 text-blue-700 border border-blue-100"
                      : "text-slate-500"
                  )}
                  onClick={(e) => {
                    column.toggleSorting(isSorted === "asc", !!e.shiftKey);
                  }}
                >
                  <GraduationCap className="h-4 w-4" />
                  {isSorted === "asc" && <ArrowUp className="absolute -right-1 -top-1 h-3 w-3" />}
                  {isSorted === "desc" && <ArrowDown className="absolute -right-1 -top-1 h-3 w-3" />}
                  {isSorted && sortIndex > -1 && (
                    <span className="absolute -left-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white shadow-sm">
                      {sortIndex + 1}
                    </span>
                  )}
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total Diklat yang Diikuti (Shift+Klik untuk multi-sort)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    cell: ({ row }) => {
      const count = row.getValue("jumlah_diklat") || 0;
      return (
        <div className="flex justify-center">
          <span className={cn(
            "text-xs font-mono font-bold px-2 py-0.5 rounded-full",
            count > 0 
              ? "text-blue-600 bg-blue-50" 
              : "text-slate-400 bg-slate-50"
          )}>
            {count}
          </span>
        </div>
      );
    },
  },

  // 7. ACTIONS (MENU)
  {
    id: "actions",
    meta: {
        className: "w-[60px] text-center",
    },
    cell: ({ row }) => <ActionCell row={row} />,
  },
];