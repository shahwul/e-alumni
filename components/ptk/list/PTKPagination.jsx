import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useState, useEffect } from "react";

export function PTKPagination({ page, limit, totalData, setPage, loading }) {
  const totalPage = Math.ceil(totalData / limit);
  const startEntry = (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, totalData);

  const [inputPage, setInputPage] = useState(page);

  // sync input kalau page berubah dari luar (klik / filter)
  useEffect(() => {
    setInputPage(page);
  }, [page]);

  const goToPage = (next) => {
    if (loading) return;
    if (next < 1) next = 1;
    if (next > totalPage) next = totalPage;
    setPage(next);
  };

  return (
    <div className="border-t border-slate-100 bg-white p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
      {/* INFO */}
      <div className="text-slate-500">
        Menampilkan{" "}
        <span className="font-medium text-slate-900">
          {totalData > 0 ? startEntry : 0}
        </span>{" "}
        - <span className="font-medium text-slate-900">{endEntry}</span> dari{" "}
        <span className="font-medium text-slate-900">{totalData}</span> data
      </div>

      {/* CONTROLS */}
      <div className="flex items-center gap-2">
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
        <div className="flex items-center gap-1">
          <span className="text-slate-500">Hal</span>
          <Input
            type="number"
            min={1}
            max={totalPage}
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            onBlur={() => goToPage(Number(inputPage))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                goToPage(Number(inputPage));
              }
            }}
            className="
              h-8 w-16 text-center
              [appearance:textfield]
              [&::-webkit-inner-spin-button]:appearance-none
              [&::-webkit-outer-spin-button]:appearance-none
            "
            disabled={loading}
          />
          <span className="text-slate-500">/ {totalPage || 1}</span>
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
