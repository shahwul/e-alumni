// components/ptk/list/PTKPagination.jsx

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useState, useEffect } from "react";

export function PTKPagination({ page, limit, totalData, setPage, setLimit, loading }) {
  const totalPage = Math.ceil(totalData / limit) || 1; 
  
  const startEntry = totalData === 0 ? 0 : (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, totalData);

  const [inputPage, setInputPage] = useState(page);

  useEffect(() => {
    setInputPage(page);
  }, [page]);

  const goToPage = (next) => {
    if (loading) return;
    let target = next;
    if (target < 1) target = 1;
    if (target > totalPage) target = totalPage;
    setPage(target);
  };

  return (
    <div className="border-t border-slate-100 bg-white p-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 text-sm">
      
      {/* KIRI: INFO & LIMIT */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full sm:w-auto justify-between sm:justify-start">
        
        <div className="text-slate-500 whitespace-nowrap">
          Menampilkan{" "}
          <span className="font-medium text-slate-900">{startEntry}</span> -{" "}
          <span className="font-medium text-slate-900">{endEntry}</span> dari{" "}
          <span className="font-medium text-slate-900">{totalData}</span> data
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 whitespace-nowrap hidden sm:inline-block">Baris per hal:</span>
          <Select
            value={String(limit)} 
            onValueChange={(value) => {
               setLimit(Number(value)); 
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={limit} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 25, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={String(pageSize)}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KANAN: CONTROLS */}
      <div className="flex items-center gap-2">
        {/* Jump -5 */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => goToPage(page - 5)}
          disabled={page <= 1 || loading}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Prev */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1 || loading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Input halaman */}
        <div className="flex items-center gap-1 mx-1">
          <Input
            type="number"
            min={1}
            max={totalPage}
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            onBlur={() => {
                if(inputPage !== "" && Number(inputPage) !== page) goToPage(Number(inputPage));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                goToPage(Number(inputPage));
              }
            }}
            className="h-8 w-12 p-0 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            disabled={loading}
          />
          <span className="text-slate-500">/ {totalPage}</span>
        </div>

        {/* Next */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => goToPage(page + 1)}
          disabled={page >= totalPage || loading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Jump +5 */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => goToPage(page + 5)}
          disabled={page >= totalPage || loading}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}