"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Copy, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DetailPTKDialog } from "./DetailPTKDialog"; // Pastikan file ini ada

// --- KOMPONEN KHUSUS UNTUK CELL ACTIONS ---
// Kita butuh komponen terpisah agar bisa pakai useState untuk Dialog
const ActionCell = ({ row }) => {
  const ptk = row.original;
  const [openDetail, setOpenDetail] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(ptk.nik)}>
            <Copy className="mr-2 h-4 w-4" /> Salin NIK
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Tombol Trigger Popup Detail */}
          <DropdownMenuItem onSelect={() => setOpenDetail(true)}>
             <Eye className="mr-2 h-4 w-4" /> Lihat Detail History
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Popup Dialog-nya dirender di sini */}
      <DetailPTKDialog 
        open={openDetail} 
        onOpenChange={setOpenDetail} 
        nik={ptk.nik} 
      />
    </>
  );
};

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
        <span className="font-bold text-slate-900">{row.getValue("nama_ptk")}</span>
        <span className="text-xs text-slate-500">{row.original.nik}</span>
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
          className={isSudah ? "bg-green-600 hover:bg-green-700" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}
        >
          {isSudah ? "Sudah Dilatih" : "Belum"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    // Panggil komponen ActionCell yang kita buat di atas
    cell: ({ row }) => <ActionCell row={row} />,
  },
];