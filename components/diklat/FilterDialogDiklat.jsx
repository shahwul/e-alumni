"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, ChevronsUpDown, XCircle, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { id as localeId } from "date-fns/locale";

const MODA_OPTIONS = ["Luring", "Daring", "Hybrid"];
const KATEGORI_OPTIONS = [
  { label: "Pelatihan", value: "Pelatihan" },
  { label: "Non Pelatihan", value: "Non_Pelatihan" }
];
const PROGRAM_OPTIONS = [
  { label: "Nasional", value: "Nasional" },
  { label: "BBGTK DIY", value: "BBGTK_DIY" }
];

export default function FilterDialogDiklat({ isOpen, onClose, onApply }) {
  const [filters, setFilters] = useState({
    dateRange: { from: undefined, to: undefined },
    rumpun: "",
    sub_rumpun: "",
    moda: [],
    kategori: [],
    program: [],
    jenjang: [],
    jabatan: []
  });

  const [rumpunOptions, setRumpunOptions] = useState([]);
  const [subRumpunOptions, setSubRumpunOptions] = useState([]);
  const [jenjangOptions, setJenjangOptions] = useState([]);
  const [jabatanOptions, setJabatanOptions] = useState([]);

  const [openModa, setOpenModa] = useState(false);
  const [openKategori, setOpenKategori] = useState(false);
  const [openProgram, setOpenProgram] = useState(false);
  const [openJenjang, setOpenJenjang] = useState(false);
  const [openJabatan, setOpenJabatan] = useState(false);

  useEffect(() => {
    async function fetchOptions() {
      try {
        const [resRumpun, resJenjang, resJabatan] = await Promise.all([
          fetch('/api/ref/rumpun'),
          fetch('/api/ref/jenjang'),
          fetch('/api/ref/jabatan')
        ]);

        if (resRumpun.ok) setRumpunOptions(await resRumpun.json());
        if (resJenjang.ok) {
          const data = await resJenjang.json();
          setJenjangOptions(data.map(d => d.level_name));
        }
        if (resJabatan.ok) {
          const data = await resJabatan.json();
          setJabatanOptions(data.map(d => d.occupation_name));
        }
      } catch (err) {
        console.error("Gagal load referensi:", err);
      }
    }
    if (isOpen) fetchOptions();
  }, [isOpen]);

  useEffect(() => {
    if (!filters.rumpun || filters.rumpun === "ALL") {
      setSubRumpunOptions([]);
      setFilters(prev => ({ ...prev, sub_rumpun: "" }));
      return;
    }
    async function fetchSub() {
      try {
        const res = await fetch(`/api/ref/sub-rumpun?topic_id=${filters.rumpun}`);
        if (res.ok) setSubRumpunOptions(await res.json());
      } catch (e) { console.error(e); }
    }
    setFilters(prev => ({ ...prev, sub_rumpun: "" }));
    fetchSub();
  }, [filters.rumpun]);

  const toggleSelection = (field, value) => {
    setFilters(prev => {
      const current = prev[field];
      const isSelected = current.includes(value);
      return {
        ...prev,
        [field]: isSelected ? current.filter(i => i !== value) : [...current, value]
      };
    });
  };

  const handleReset = () => {
    setFilters({
      dateRange: { from: undefined, to: undefined },
      rumpun: "",
      sub_rumpun: "",
      moda: [],
      kategori: [],
      program: [],
      jenjang: [],
      jabatan: []
    });
  };

  const handleApply = () => {
    const { dateRange, ...restFilters } = filters;

    const appliedFilters = {
      ...restFilters,
      start_date: filters.dateRange?.from ? format(filters.dateRange.from, "yyyy-MM-dd") : "",
      end_date: filters.dateRange?.to ? format(filters.dateRange.to, "yyyy-MM-dd") : 
              (filters.dateRange?.from ? format(filters.dateRange.from, "yyyy-MM-dd") : ""),
      moda: filters.moda.join(','),
      kategori: filters.kategori.join(','),
      program: filters.program.join(','),
      jenjang: filters.jenjang.join(','),
      jabatan: filters.jabatan.join(','),
    };
    
    Object.keys(appliedFilters).forEach(key => {
      if (appliedFilters[key] === "" || appliedFilters[key] === null) {
        delete appliedFilters[key];
      }
    });

    onApply(appliedFilters);
    onClose();
  };

  const MultiSelectBox = ({ label, options, selectedValues, fieldName, openState, setOpenState, placeholder }) => (
    <div className="space-y-2">
      <Label className="text-xs text-slate-500">{label}</Label>
      <Popover open={openState} onOpenChange={setOpenState}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between px-3 font-normal text-sm h-auto min-h-[40px] border-slate-200">
            <span className="truncate whitespace-normal text-left">
              {selectedValues.length === 0 ? placeholder : `${selectedValues.length} Terpilih`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder={`Cari ${label.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>Tidak ditemukan.</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => {
                  const val = typeof opt === 'string' ? opt : opt.value;
                  const lab = typeof opt === 'string' ? opt : opt.label;
                  const isSelected = selectedValues.includes(val);

                  return (
                    <CommandItem key={val} value={lab} onSelect={() => toggleSelection(fieldName, val)}>
                      <div className={cn("mr-2 flex h-4 w-4 items-center justify-center border rounded-sm", 
                        isSelected ? "bg-blue-600 border-blue-600 text-white" : "opacity-50 border-slate-400"
                      )}>
                        <Check className={cn("h-3 w-3 text-white transition-opacity", isSelected ? "opacity-100" : "opacity-0")} />
                      </div>
                      {lab}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {selectedValues.map((val) => {
            const item = options.find(o => (typeof o === 'string' ? o === val : o.value === val));
            const displayLabel = typeof item === 'string' ? item : (item?.label || val);
            
            return (
              <Badge key={val} variant="secondary" className="text-[10px] bg-blue-50 text-blue-700 border-blue-100 pr-1 py-1">
                {displayLabel}
                <button className="ml-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleSelection(fieldName, val); }}>
                  <XCircle className="h-3 w-3 text-blue-400 hover:text-red-500" />
                </button>
              </Badge>
            );
          })}
          <Button variant="ghost" size="sm" className="h-5 text-[10px] text-red-500 px-1 hover:bg-red-50" onClick={() => setFilters(prev => ({...prev, [fieldName]: []}))}>
            Reset
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[650px] bg-white max-h-[90vh] overflow-y-auto p-0 gap-0 border-none shadow-2xl">
        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-slate-900">Filter Data Diklat</DialogTitle>
            <DialogDescription className="text-slate-500">Saring data pelatihan berdasarkan waktu, topik, atau sasaran.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* SECTION 1: WAKTU & TOPIK */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <span className="h-4 w-1 bg-blue-600 rounded-full"></span> Waktu & Topik
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-semibold text-slate-600">Rentang Tanggal Pelaksanaan</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal border-slate-200 h-10", !filters.dateRange?.from && "text-slate-400")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange?.from ? (
                          filters.dateRange.to ? 
                            `${format(filters.dateRange.from, "dd MMM y", { locale: localeId })} - ${format(filters.dateRange.to, "dd MMM y", { locale: localeId })}` : 
                            format(filters.dateRange.from, "dd MMM y", { locale: localeId })
                        ) : <span>Pilih rentang tanggal...</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar 
                        initialFocus 
                        mode="range" 
                        defaultMonth={filters.dateRange?.from} 
                        selected={filters.dateRange} 
                        onSelect={(range) => setFilters(prev => ({ ...prev, dateRange: range }))} 
                        numberOfMonths={2} 
                        locale={localeId} 
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">Rumpun (Topic)</Label>
                  <Select value={filters.rumpun} onValueChange={(val) => setFilters({ ...filters, rumpun: val === "ALL" ? "" : val })}>
                    <SelectTrigger className="border-slate-200 h-10"><SelectValue placeholder="Semua Rumpun" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua Rumpun</SelectItem>
                      {rumpunOptions.map((r) => (<SelectItem key={r.id} value={String(r.id)}>{r.topic_name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">Sub Rumpun</Label>
                  <Select disabled={!filters.rumpun || filters.rumpun === "ALL"} value={filters.sub_rumpun} onValueChange={(val) => setFilters({ ...filters, sub_rumpun: val === "ALL" ? "" : val })}>
                    <SelectTrigger className="border-slate-200 h-10"><SelectValue placeholder="Semua Sub Rumpun" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua Sub Rumpun</SelectItem>
                      {subRumpunOptions.map((sub) => (<SelectItem key={sub.id} value={String(sub.id)}>{sub.sub_topic_name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-100" />

            {/* SECTION 2: KRITERIA PELATIHAN */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <span className="h-4 w-1 bg-green-500 rounded-full"></span> Kriteria Pelatihan
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MultiSelectBox 
                  label="Kategori Kegiatan" 
                  placeholder="Pilih Kategori..."
                  options={KATEGORI_OPTIONS} 
                  selectedValues={filters.kategori} 
                  fieldName="kategori"
                  openState={openKategori}
                  setOpenState={setOpenKategori}
                />
                <MultiSelectBox 
                  label="Sumber Program" 
                  placeholder="Pilih Program..."
                  options={PROGRAM_OPTIONS} 
                  selectedValues={filters.program} 
                  fieldName="program"
                  openState={openProgram}
                  setOpenState={setOpenProgram}
                />
                <div className="md:col-span-2">
                  <MultiSelectBox 
                    label="Moda Pelatihan" 
                    placeholder="Pilih Moda..."
                    options={MODA_OPTIONS} 
                    selectedValues={filters.moda} 
                    fieldName="moda"
                    openState={openModa}
                    setOpenState={setOpenModa}
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-slate-100" />

            {/* SECTION 3: SASARAN PESERTA */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <span className="h-4 w-1 bg-purple-500 rounded-full"></span> Sasaran Peserta
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MultiSelectBox 
                  label="Jenjang Sasaran" 
                  placeholder="Pilih Jenjang..."
                  options={jenjangOptions} 
                  selectedValues={filters.jenjang} 
                  fieldName="jenjang"
                  openState={openJenjang}
                  setOpenState={setOpenJenjang}
                />
                <MultiSelectBox 
                  label="Jabatan Sasaran" 
                  placeholder="Cari Jabatan..."
                  options={jabatanOptions} 
                  selectedValues={filters.jabatan} 
                  fieldName="jabatan"
                  openState={openJabatan}
                  setOpenState={setOpenJabatan}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-between w-full border-t border-slate-100 p-4 sticky bottom-0 bg-slate-50/80 backdrop-blur-sm rounded-b-lg">
          <Button type="button" variant="ghost" onClick={handleReset} className="text-slate-500 hover:text-red-600 hover:bg-red-50 font-medium transition-colors">
            Reset Semua
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="border-slate-200">Batal</Button>
            <Button type="submit" onClick={handleApply} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-md shadow-blue-100 transition-all">
              Terapkan Filter
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}