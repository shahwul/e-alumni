"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, ChevronsUpDown, XCircle, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar"; 
import { id } from "date-fns/locale";
import { Input } from "@/components/ui/input"; // Pakai Input Shadcn

// --- DATA OPSI ---
const MODA_OPTIONS = ["Luring", "Daring", "Hybrid"];
const KATEGORI_OPTIONS = ["Pelatihan", "Non Pelatihan"];
const PROGRAM_OPTIONS = ["Nasional", "BBGTK DIY"];
const JENJANG_OPTIONS = ["PAUD", "TK", "SD", "SMP", "SMA", "Lainnya", "Semua Jenjang"];
const JABATAN_OPTIONS = [
  "Guru Matematika", "Guru BK", "Guru IPS", "Guru Kelas", 
  "Guru IPA", "Guru A. Islam", "Kepala Sekolah", "Guru A. Kristen",
  "Guru PJOK", "Guru Seni Budaya", "Tenaga Administrasi"
];

export default function FilterDialogDiklat({ isOpen, onClose, onApply }) {
  // State Filter
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

  // State Popover Open/Close
  const [rumpunOptions, setRumpunOptions] = useState([]); 
  const [subRumpunOptions, setSubRumpunOptions] = useState([]);
  const [openModa, setOpenModa] = useState(false);
  const [openKategori, setOpenKategori] = useState(false);
  const [openProgram, setOpenProgram] = useState(false);
  const [openJenjang, setOpenJenjang] = useState(false);
  const [openJabatan, setOpenJabatan] = useState(false);

  // --- HANDLER UPDATE STATE ---
  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

    useEffect(() => {
      async function fetchRumpun() {
        try {
          const res = await fetch('/api/ref/rumpun'); 
          if (res.ok) {
              const data = await res.json();
              setRumpunOptions(data);
          }
        } catch (err) { console.error("Gagal load rumpun:", err); }
      }
      fetchRumpun();
    }, []); 

      // 5. FETCH SUB RUMPUN
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

  // Generic Toggle untuk Array (Multi-select)
  const toggleSelection = (field, value) => {
    setFilters(prev => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
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
    // Convert Date Range object back to string for API consistency if needed
    // Or pass object if parent handles it. Assuming parent expects strings based on previous code:
    const appliedFilters = {
        ...filters,
        startDate: filters.dateRange?.from ? format(filters.dateRange.from, "yyyy-MM-dd") : "",
        endDate: filters.dateRange?.to ? format(filters.dateRange.to, "yyyy-MM-dd") : 
                 (filters.dateRange?.from ? format(filters.dateRange.from, "yyyy-MM-dd") : "")
    };
    onApply(appliedFilters);
    onClose();
  };

  // Helper Component untuk Multi-Select Box
  const MultiSelectBox = ({ label, options, selectedValues, fieldName, openState, setOpenState, placeholder }) => (
    <div className="space-y-2">
      <Label className="text-xs text-slate-500">{label}</Label>
      <Popover open={openState} onOpenChange={setOpenState}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between px-3 font-normal text-sm h-auto min-h-[40px]">
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
                {options.map((opt) => (
                  <CommandItem key={opt} value={opt} onSelect={() => toggleSelection(fieldName, opt)}>
                    <div className={cn("mr-2 flex h-4 w-4 items-center justify-center border rounded-sm", 
                       selectedValues.includes(opt) ? "bg-primary border-primary text-primary-foreground" : "opacity-50 border-slate-400"
                    )}>
                       <Check className={cn("h-3 w-3", selectedValues.includes(opt) ? "opacity-100" : "opacity-0")} />
                    </div>
                    {opt}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Badges */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {selectedValues.map((val) => (
            <Badge key={val} variant="secondary" className="text-[10px] bg-slate-100 text-slate-700 border-slate-200 pointer-events-auto pr-1">
              {val} 
              <button className="ml-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleSelection(fieldName, val); }}>
                <XCircle className="h-3 w-3 text-slate-400 hover:text-red-500" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="h-5 text-[10px] text-red-500 px-1" onClick={() => setFilters(prev => ({...prev, [fieldName]: []}))}>
            Reset
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[650px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Data Diklat</DialogTitle>
          <DialogDescription>Saring data pelatihan berdasarkan waktu, topik, atau sasaran.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          
          {/* === SECTION 1: WAKTU & TOPIK === */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
              <span className="h-4 w-1 bg-blue-600 rounded-full"></span> Waktu & Topik
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Date Range */}
               <div className="space-y-2 md:col-span-2">
                 <Label className="text-xs text-slate-500">Rentang Tanggal Pelaksanaan</Label>
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !filters.dateRange?.from && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange?.from ? (
                        filters.dateRange.to ? `${format(filters.dateRange.from, "dd MMM y", {locale:id})} - ${format(filters.dateRange.to, "dd MMM y", {locale:id})}` : format(filters.dateRange.from, "dd MMM y", {locale:id})
                      ) : <span>Pilih tanggal...</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar initialFocus mode="range" defaultMonth={filters.dateRange?.from} selected={filters.dateRange} onSelect={(range) => setFilters(prev => ({...prev, dateRange: range}))} numberOfMonths={2} locale={id} />
                  </PopoverContent>
                </Popover>
               </div>

               {/* Rumpun */}
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">Rumpun</Label>
                <Select value={filters.rumpun} onValueChange={(val) => setFilters({...filters, rumpun: val === "ALL" ? "" : val})}>
                  <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua</SelectItem>
                    {rumpunOptions.map((r) => (<SelectItem key={r.id} value={String(r.id)}>{r.topic_name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sub Rumpun */}
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">Sub Rumpun</Label>
                <Select disabled={!filters.rumpun || filters.rumpun === "ALL"} value={filters.sub_rumpun} onValueChange={(val) => setFilters({...filters, sub_rumpun: val === "ALL" ? "" : val})}>
                    <SelectTrigger><SelectValue placeholder="Pilih Sub..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua Sub</SelectItem>
                      {subRumpunOptions.map((sub) => (<SelectItem key={sub.id} value={String(sub.id)}>{sub.sub_topic_name}</SelectItem>))}
                    </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* === SECTION 2: KRITERIA PELATIHAN === */}
          <div className="space-y-3">
             <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
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

          <Separator />

          {/* === SECTION 3: SASARAN PESERTA === */}
          <div className="space-y-3">
             <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
               <span className="h-4 w-1 bg-purple-500 rounded-full"></span> Sasaran Peserta
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <MultiSelectBox 
                    label="Jenjang Sasaran" 
                    placeholder="Pilih Jenjang..."
                    options={JENJANG_OPTIONS} 
                    selectedValues={filters.jenjang} 
                    fieldName="jenjang"
                    openState={openJenjang}
                    setOpenState={setOpenJenjang}
                />

                <MultiSelectBox 
                    label="Jabatan Sasaran" 
                    placeholder="Cari Jabatan..."
                    options={JABATAN_OPTIONS} 
                    selectedValues={filters.jabatan} 
                    fieldName="jabatan"
                    openState={openJabatan}
                    setOpenState={setOpenJabatan}
                />

             </div>
          </div>

        </div>

        <DialogFooter className="flex justify-between w-full border-t pt-4 sticky bottom-0 bg-white">
          <Button type="button" variant="ghost" onClick={handleReset} className="text-slate-500 hover:text-red-600">Reset Semua</Button>
          <Button type="submit" onClick={handleApply} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">Terapkan Filter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}