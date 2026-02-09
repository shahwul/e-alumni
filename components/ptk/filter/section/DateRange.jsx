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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function DateRangeFilter() {
  const { filters, setFilters } = useFilterContext();
  const isJudulSelected = filters.judul_diklat.length > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Tanggal */}
      <div className="space-y-2 sm:col-span-2">
        <div className="flex justify-between items-center">
          <Label
            className={cn(
              "text-xs",
              isJudulSelected ? "text-slate-400" : "text-slate-500",
            )}
          >
            Rentang Tanggal Pelaksanaan
          </Label>
          {isJudulSelected && (
            <span className="text-[10px] text-red-500 italic">
              Reset judul diklat untuk memilih tanggal
            </span>
          )}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={isJudulSelected}
              className={cn(
                "w-full justify-between text-left font-normal pr-2",
                !filters.dateRange?.from && "text-muted-foreground",
                isJudulSelected &&
                  "bg-slate-100 text-slate-400 cursor-not-allowed",
              )}
            >
              {/* Left content */}
              <div className="flex items-center gap-2 truncate">
                <CalendarIcon className="h-4 w-4 shrink-0" />

                {isJudulSelected ? (
                  <span>Terkunci (Mode Judul Aktif)</span>
                ) : filters.dateRange?.from ? (
                  filters.dateRange.to ? (
                    `${format(filters.dateRange.from, "dd MMM y", { locale: id })} - ${format(filters.dateRange.to, "dd MMM y", { locale: id })}`
                  ) : (
                    format(filters.dateRange.from, "dd MMM y", { locale: id })
                  )
                ) : (
                  <span>Pilih tanggal...</span>
                )}
              </div>

              {filters.dateRange?.from && !isJudulSelected && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilters((prev) => ({ ...prev, dateRange: undefined }));
                  }}
                  className="ml-2 flex h-6 w-6 items-center justify-center rounded hover:bg-red-50 text-red-400 hover:text-red-600"
                >
                  <XCircle className="h-4 w-4" />
                </span>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              initialFocus
              mode="range"
              captionLayout="dropdown"
              fromYear={2025}
              toYear={2035}
              defaultMonth={filters.dateRange?.from}
              selected={filters.dateRange}
              onSelect={(range) =>
                setFilters((prev) => ({ ...prev, dateRange: range }))
              }
              numberOfMonths={2}
              locale={id}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
