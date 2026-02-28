"use client";

import * as React from "react";
import { Check, ChevronsUpDown, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = "Pilih opsi...",
  emptyMessage = "Tidak ditemukan."
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-9 text-xs px-3 font-normal overflow-hidden"
        >
          <span className="truncate mr-2 flex-1 text-left">
            {value ? value : placeholder}
          </span>

          <div className="flex items-center gap-1 shrink-0">
            {value && (
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange("");
                }}
                className="flex h-5 w-5 items-center justify-center rounded hover:bg-red-50 cursor-pointer transition-colors"
              >
                <XCircle className="h-3.5 w-3.5 text-red-400 hover:text-red-600" />
              </div>
            )}
            <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 z-[9999]"
        align="start"
        sideOffset={4}
      >
        <Command className="w-full">
          <CommandInput placeholder={`Cari ${placeholder.toLowerCase()}...`} className="h-8 text-xs" />
          <CommandList
            className="max-h-[250px] overflow-y-auto overflow-x-hidden custom-scrollbar"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <CommandEmpty className="py-2 text-xs text-center text-muted-foreground">
              {emptyMessage}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={(currentValue) => {
                    onChange(option === value ? "" : option);
                    setOpen(false);
                  }}
                  className="text-xs cursor-pointer py-2"
                >
                  <Check
                    className={cn(
                      "mr-2 h-3.5 w-3.5 shrink-0",
                      value === option ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{option}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}