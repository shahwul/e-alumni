"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

import { useFilterContext } from "../FilterContext";
import { useFilterData } from "../useFilterData";

export function RumpunFilter() {
  const { filters, setFilters } = useFilterContext();
  const { rumpunOptions, subRumpunOptions } = useFilterData(
    filters,
    setFilters,
  );

  const hasRumpun = !!filters.rumpun;
  const hasSubRumpun = !!filters.sub_rumpun;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* ================= RUMPUN ================= */}
      <div className="space-y-2">
        <Label className="text-xs text-slate-500">Rumpun</Label>

        <Select
          value={filters.rumpun || "ALL"}
          onValueChange={(v) =>
            setFilters((p) => ({
              ...p,
              rumpun: v === "ALL" ? "" : v,
            }))
          }
        >
          <SelectTrigger className="pr-2">
            <div className="flex items-center justify-between w-full">
              <SelectValue placeholder="Semua Rumpun" />

              {hasRumpun && (
                <span
                  role="button"
                  tabIndex={0}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFilters((p) => ({
                      ...p,
                      rumpun: "",
                      sub_rumpun: "",
                    }));
                  }}
                  className="ml-2 flex h-6 w-6 items-center justify-center rounded hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 text-red-400 hover:text-red-600" />
                </span>
              )}
            </div>
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="ALL">Semua</SelectItem>
            {rumpunOptions.map((r) => (
              <SelectItem key={r.id} value={String(r.id)}>
                {r.topic_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ================= SUB RUMPUN ================= */}
      <div className="space-y-2">
        <Label className="text-xs text-slate-500">Sub Rumpun</Label>

        <Select
          disabled={!filters.rumpun}
          value={filters.sub_rumpun || "ALL"}
          onValueChange={(v) =>
            setFilters((p) => ({
              ...p,
              sub_rumpun: v === "ALL" ? "" : v,
            }))
          }
        >
          <SelectTrigger className="pr-2">
            <div className="flex items-center justify-between w-full">
              <SelectValue
                placeholder={filters.rumpun ? "Semua Sub Rumpun" : "Semua"}
              />

              {hasSubRumpun && (
                <span
                  role="button"
                  tabIndex={0}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFilters((p) => ({
                      ...p,
                      sub_rumpun: "",
                    }));
                  }}
                  className="ml-2 flex h-6 w-6 items-center justify-center rounded hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 text-red-400 hover:text-red-600" />
                </span>
              )}
            </div>
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="ALL">Semua</SelectItem>
            {subRumpunOptions.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.sub_topic_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
