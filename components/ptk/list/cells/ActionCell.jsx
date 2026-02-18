"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, File, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { DetailPTKDialog } from "../../detailPTK/preview/DetailPTKDialog";

export function ActionCell({ row }) {
  const ptk = row.original;
  const [openDetail, setOpenDetail] = useState(false);
  const router = useRouter();

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0"
            onClick={(e) => e.stopPropagation()} 
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end"
          onCloseAutoFocus={(e) => e.preventDefault()} 
        >
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          
          <DropdownMenuItem 
            onSelect={(e) => {
              setOpenDetail(true);
            }}
          >
            <Eye className="mr-2 h-4 w-4" /> Lihat Detail History
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem 
            onSelect={() => router.push(`/ptk/${ptk.nik}`)}
          >
            <File className="mr-2 h-4 w-4" /> Lihat Data Lengkap
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DetailPTKDialog
        open={openDetail}
        onOpenChange={setOpenDetail}
        nik={ptk.nik}
      />
    </div>
  );
}