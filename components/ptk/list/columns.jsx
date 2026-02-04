"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { ActionCell } from "./cells/ActionCell";
import { CopyButton } from "./cells/Copybutton";

// --- DEFINISI KOLOM ---
export const columns = [
  {
    accessorKey: "nama_ptk",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama PTK
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="flex flex-col">
        <div className="font-bold text-slate-900">
          {row.getValue("nama_ptk")}
        </div>
        <div className=" flex items-center text-xs text-slate-500 ">
          <p>{row.original.nik}</p>
          <CopyButton row={row} />
        </div>
      </div>
    ),
  },
  {
    accessorKey: "nama_sekolah",
    header: "Unit Kerja",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm">{row.getValue("nama_sekolah")}</span>
        <span className="text-xs text-slate-500">{row.original.kabupaten}</span>
      </div>
    ),
  },
  {
    accessorKey: "status_kepegawaian",
    header: "Status",
  },
  {
    accessorKey: "is_sudah_pelatihan",
    header: "Pelatihan",
    cell: ({ row }) => {
      const isSudah = row.getValue("is_sudah_pelatihan");
      return (
        <Badge
          variant={isSudah ? "default" : "secondary"}
          className={
            isSudah
              ? "bg-green-600 hover:bg-green-700"
              : "bg-slate-200 text-slate-600 hover:bg-slate-300"
          }
        >
          {isSudah ? "Sudah Dilatih" : "Belum"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell row={row} />,
  },
];
