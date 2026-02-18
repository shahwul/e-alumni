"use client";

import { useState } from "react";
import { useDebounceSearch } from "@/hooks/useDebounceSearch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandGroup,
  CommandEmpty,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DiklatFilter({ selectedDiklat = [], onChange }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const { results = [], loading } = useDebounceSearch({
    endpoint: "/api/diklat/search",
    query: search,
  });

  const toggleDiklat = (title) => {
    if (!onChange) return;

    if (selectedDiklat.includes(title)) {
      onChange(selectedDiklat.filter((t) => t !== title));
    } else {
      onChange([...selectedDiklat, title]);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs text-slate-500">
        Judul Diklat (Multi Select)
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between px-3 h-auto min-h-10 font-normal text-left"
          >
            <span className="truncate whitespace-normal">
              {selectedDiklat.length === 0
                ? "Ketik judul..."
                : `${selectedDiklat.length} Judul Terpilih`}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-100 p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Ketik min 3 huruf..."
              value={search}
              onValueChange={setSearch}
            />

            <CommandList className="max-h-[250px] overflow-y-auto overflow-x-hidden custom-scrollbar">
              {loading && (
                <div className="p-4 text-xs text-center text-slate-500">
                  Mencari...
                </div>
              )}

              {!loading && results.length === 0 && search.length > 2 && (
                <CommandEmpty>Diklat tidak ditemukan.</CommandEmpty>
              )}

              <CommandGroup>
                {results.map((item, idx) => (
                  <CommandItem
                    key={idx}
                    value={item.title}
                    onSelect={() => toggleDiklat(item.title)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center border rounded-sm",
                        selectedDiklat.includes(item.title)
                          ? "bg-primary border-primary text-primary-foreground"
                          : "opacity-50 border-slate-400"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-3 w-3",
                          selectedDiklat.includes(item.title)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </div>
                    {item.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
