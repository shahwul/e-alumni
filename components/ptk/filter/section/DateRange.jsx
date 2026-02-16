"use client";

import { useFilterContext } from "../FilterContext";

// UI Components
import { XCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Badge } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function DateRangeFilter() {
  const { filters, setFilters } = useFilterContext();

  const isJudulSelected = filters.judul_diklat.length > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2 sm:col-span-2">
        <div className="flex justify-between items-center">
          <Label className="text-xs text-slate-500 font-medium">
            Rentang Tanggal Pelaksanaan
          </Label>
          {isJudulSelected && (
            <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              Sinkron dengan Judul Diklat
            </span>
          )}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-between text-left font-normal pr-2 border-slate-200 hover:bg-slate-50",
                !filters.dateRange?.from && "text-muted-foreground",
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />

                {filters.dateRange?.from ? (
                  filters.dateRange.to ? (
                    `${format(filters.dateRange.from, "dd MMM y", { locale: id })} - ${format(filters.dateRange.to, "dd MMM y", { locale: id })}`
                  ) : (
                    format(filters.dateRange.from, "dd MMM y", { locale: id })
                  )
                ) : (
                  <span>Pilih rentang tanggal...</span>
                )}
              </div>

              {filters.dateRange?.from && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilters((prev) => ({ ...prev, dateRange: undefined }));
                  }}
                  className="ml-2 flex h-6 w-6 items-center justify-center rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                </span>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0 shadow-xl border-slate-200" align="center">
            <Calendar
              initialFocus
              mode="range"
              captionLayout="dropdown"
              fromYear={2020} 
              toYear={2030}
              defaultMonth={filters.dateRange?.from}
              selected={filters.dateRange}
              onSelect={(range) =>
                setFilters((prev) => ({ ...prev, dateRange: range }))
              }
              numberOfMonths={2}
              locale={id}
              className="rounded-md border-0"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}