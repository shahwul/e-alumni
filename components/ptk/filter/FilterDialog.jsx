"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { FilterProvider, useFilterContext } from "./FilterContext";


import { WilayahFilter } from "./section/WilayahFilter";
import { KriteriaPTK } from "./section/KriteriaPTKFilter";
import { SekolahFilter } from "./section/SekolahFilter";
import { DiklatFilter } from "./section/DiklatFilter";
import { RumpunFilter } from "./section/RumpunFilter";
import { DateRangeFilter } from "./section/DateRange";
import { ModeSwitcher } from "./section/ModeSwitcher";
import { KategoriJenisProgramFilter } from "./section/KategoriJenisProgramFilter";

function FilterDialogContent({ onApplyFilter, activeFilters }) {
  const { filters, setFilters, resetFilters } = useFilterContext();

  useEffect(() => {
    if (activeFilters) {
      setFilters(activeFilters);
    }
  }, [activeFilters, setFilters]);

  const handleApply = () => {
    onApplyFilter(filters);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Filter Data PTK</DialogTitle>
      </DialogHeader>

      <div className="grid gap-5 py-4 px-1">
        <WilayahFilter />
        <Separator />
        <KriteriaPTK />
        <SekolahFilter />
        <Separator />
        <ModeSwitcher />
        <KategoriJenisProgramFilter />
        <DiklatFilter />
        <DateRangeFilter />
        <RumpunFilter />
      </div>

      <DialogFooter className="flex justify-between border-t sticky bottom-0 bg-white py-4 mt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={resetFilters}
          className="text-slate-500 hover:text-red-600"
        >
          Reset Semua
        </Button>

        <Button
          onClick={handleApply}
          className="bg-blue-600 hover:bg-blue-700 text-white min-w-30"
        >
          Terapkan Filter
        </Button>
      </DialogFooter>
    </>
  );
}

function FilterDialogTrigger({ filterCount }) {
  return (
    <DialogTrigger asChild>
      <Button variant="outline" className="relative border-dashed gap-2">
        <Filter size={16} />
        Filter

        {filterCount > 0 && (
          <span className="flex items-center justify-center h-5 w-5 rounded-full
                      bg-blue-100 text-blue-700 text-[10px] font-bold"
          >
            {filterCount > 9 ? "9+" : filterCount}
          </span>
        )}
      </Button>
    </DialogTrigger>
  );
}

export function FilterDialog({ onApplyFilter, activeFilters, filterCount }) {
  return (
    <FilterProvider>
      <Dialog>
        <FilterDialogTrigger filterCount={filterCount} />

        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto pb-0">
          <FilterDialogContent 
            onApplyFilter={onApplyFilter} 
            activeFilters={activeFilters} 
          />
        </DialogContent>
      </Dialog>
    </FilterProvider>
  );
}