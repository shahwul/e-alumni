import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Separator } from "@/components/ui/separator";

import { FilterProvider, useFilterContext } from "./FilterContext";
import { getActiveFilterCount } from "./helpers/getActiveFilterCount";

// Komponen semua filter PTK
import { WilayahFilter } from "./section/WilayahFilter";
import { KriteriaPTK } from "./section/KriteriaPTKFilter";
import { SekolahFilter } from "./section/SekolahFilter";
import { DiklatFilter } from "./section/DiklatFilter";
import { RumpunFilter } from "./section/RumpunFilter";
import { DateRangeFilter } from "./section/DateRange";
import { ModeSwitcher } from "./section/ModeSwitcher";
import { KategoriJenisProgramFilter } from "./section/KategoriJenisProgramFilter";

function FilterDialogContent({ onApplyFilter }) {
  const { filters, resetFilters } = useFilterContext();

  return (
    <>
      <DialogHeader>
        <DialogTitle>Filter Data PTK</DialogTitle>
      </DialogHeader>

      <div className="grid gap-5 py-4 overflow-y-auto">
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
        {/* <div
          class="tenor-gif-embed"
          data-postid="15890113508719617554"
          data-share-method="host"
          data-aspect-ratio="1.00403"
          data-width="100%"
        >
          <a href="https://tenor.com/view/alhamdulillah-gif-15890113508719617554">
            Alhamdulillah Meme
          </a>
          from{" "}
          <a href="https://tenor.com/search/alhamdulillah-memes">
            Alhamdulillah Memes
          </a>
        </div>{" "}
        <script
          type="text/javascript"
          async
          src="https://tenor.com/embed.js"
        ></script> */}
      </div>

      <DialogFooter className="flex justify-between border-t sticky bottom-0 bg-white py-4">
        <Button
          type="button"
          variant="ghost"
          onClick={resetFilters}
          className="text-slate-500 hover:text-red-600"
        >
          Reset Semua
        </Button>

        <Button
          onClick={() => onApplyFilter(filters)}
          className="bg-blue-600 hover:bg-blue-700 text-white min-w-30"
        >
          Terapkan Filter
        </Button>
      </DialogFooter>
    </>
  );
}

function FilterDialogTrigger() {
  const { filters } = useFilterContext();
  const activeCount = getActiveFilterCount(filters);

  return (
    <DialogTrigger asChild>
      <Button variant="outline" className="gap-2 border-dashed">
        <Filter size={16} />
        Filter
        {activeCount > 0 && (
          <span
            className="flex items-center justify-center h-5 w-5 rounded-full
                     bg-blue-100 text-blue-700 text-[10px] font-bold"
          >
            {activeCount}
          </span>
        )}
      </Button>
    </DialogTrigger>
  );
}

export function FilterDialog({ onApplyFilter }) {
  return (
    <FilterProvider>
      <Dialog>
        <FilterDialogTrigger />

        <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto pb-0">
          <FilterDialogContent onApplyFilter={onApplyFilter} />
        </DialogContent>
      </Dialog>
    </FilterProvider>
  );
}
