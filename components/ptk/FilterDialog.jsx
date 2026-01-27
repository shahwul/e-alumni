"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Filter, Check, ChevronsUpDown, XCircle, Calendar as CalendarIcon, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar"; 
import { id } from "date-fns/locale";

// OPSI BARU
const KATEGORI_OPTIONS = ["Pelatihan", "Non Pelatihan"];
const PROGRAM_OPTIONS = ["Nasional", "BBGTK DIY"];

export function FilterDialog({ onApplyFilter }) {
  const [open, setOpen] = useState(false);
  
  // --- STATE UTAMA FILTER ---
  const [filters, setFilters] = useState({
    kabupaten: [],
    kecamatan: [],
    jenjang: "",
    status: "",
    sekolah: "",
    judul_diklat: [], 
    
    // State Baru
    kategori: "", 
    program: "", 

    mode_filter: "history", 
    rumpun: "",
    sub_rumpun: "",
    dateRange: { from: undefined, to: undefined }
  });

  // --- STATE DATA MASTER ---
  const [dataWilayah, setDataWilayah] = useState([]);
  const [rumpunOptions, setRumpunOptions] = useState([]); 
  
  const [openKabupaten, setOpenKabupaten] = useState(false);
  const [openKecamatan, setOpenKecamatan] = useState(false);
  
  const [openSekolah, setOpenSekolah] = useState(false);
  const [sekolahOptions, setSekolahOptions] = useState([]);
  const [sekolahSearch, setSekolahSearch] = useState("");
  const [loadingSekolah, setLoadingSekolah] = useState(false);
  
  const [openDiklat, setOpenDiklat] = useState(false);
  const [diklatOptions, setDiklatOptions] = useState([]);
  const [diklatSearch, setDiklatSearch] = useState("");
  const [loadingDiklat, setLoadingDiklat] = useState(false);
  const [subRumpunOptions, setSubRumpunOptions] = useState([]);

  // 1. FETCH WILAYAH
  useEffect(() => {
    async function fetchWilayah() {
      try {
        const res = await fetch('/api/ref/wilayah');
        const data = await res.json();
        if (Array.isArray(data)) setDataWilayah(data);
      } catch (err) { console.error("Gagal load wilayah:", err); }
    }
    fetchWilayah();
  }, []);

  // 2. FETCH RUMPUN
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

  // 3. SEARCH SEKOLAH
  useEffect(() => {
    if (!sekolahSearch) { setSekolahOptions([]); return; }
    const timer = setTimeout(async () => {
      if (sekolahSearch.length > 2) {
        setLoadingSekolah(true);
        try {
          const res = await fetch(`/api/sekolah/search?q=${sekolahSearch}`);
          if(res.ok) setSekolahOptions(await res.json());
        } catch (e) { console.error(e); } 
        finally { setLoadingSekolah(false); }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [sekolahSearch]);

  // 4. SEARCH DIKLAT
  useEffect(() => {
    if (!diklatSearch) { setDiklatOptions([]); return; }
    const timer = setTimeout(async () => {
      if (diklatSearch.length > 2) {
        setLoadingDiklat(true);
        try {
          const params = new URLSearchParams();
          params.append("q", diklatSearch);
          const res = await fetch(`/api/diklat/search?${params.toString()}`);
          if(res.ok) setDiklatOptions(await res.json());
        } catch (e) { console.error(e); } 
        finally { setLoadingDiklat(false); }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [diklatSearch]); 

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


  // --- HANDLER FUNCTIONS ---
  
  const toggleKabupaten = (namaKab) => {
    setFilters((prev) => {
      const current = prev.kabupaten;
      if (current.includes(namaKab)) return { ...prev, kabupaten: current.filter((k) => k !== namaKab) };
      return { ...prev, kabupaten: [...current, namaKab] };
    });
  };

  const toggleKecamatan = (namaKec) => {
    setFilters((prev) => {
      const current = prev.kecamatan;
      if (current.includes(namaKec)) return { ...prev, kecamatan: current.filter((k) => k !== namaKec) };
      return { ...prev, kecamatan: [...current, namaKec] };
    });
  };

  const toggleDiklat = (judul) => {
    setFilters((prev) => {
      const current = prev.judul_diklat || []; 
      if (current.includes(judul)) return { ...prev, judul_diklat: current.filter((j) => j !== judul) };
      return { ...prev, judul_diklat: [...current, judul] };
    });
  };

  const handleReset = () => {
    const empty = {
      kabupaten: [], kecamatan: [], jenjang: "", status: "", sekolah: "",
      judul_diklat: [], mode_filter: "history", 
      kategori: "", program: "", // Reset field baru
      rumpun: "", sub_rumpun: "", dateRange: { from: undefined, to: undefined }
    };
    setFilters(empty);
    onApplyFilter(empty);
  };

  const handleApply = () => {
    onApplyFilter(filters);
    setOpen(false);
  };

  const displayedWilayah = filters.kabupaten.length > 0
    ? dataWilayah.filter(w => filters.kabupaten.includes(w.kabupaten))
    : dataWilayah;

  const activeCount = [
     filters.jenjang, filters.status, filters.sekolah, 
     filters.rumpun, filters.sub_rumpun, 
     filters.kategori, filters.program, // Hitung field baru
     filters.dateRange?.from
  ].filter(val => val && val !== "ALL").length + filters.kecamatan.length + filters.kabupaten.length + filters.judul_diklat.length;

  const isDateSelected = !!filters.dateRange?.from;
  const isJudulSelected = filters.judul_diklat.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 text-slate-700 border-dashed border-slate-300">
          <Filter size={16} /> Filter
          {activeCount > 0 && (
             <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
               {activeCount}
             </span>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[650px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Data PTK</DialogTitle>
          <DialogDescription>Saring data berdasarkan wilayah, sekolah, atau riwayat.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          
          {/* === SECTION 1: WILAYAH (SAMA SEPERTI SEBELUMNYA) === */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
              <span className="h-4 w-1 bg-blue-600 rounded-full"></span> Wilayah
            </h4>
            <div className="flex flex-col gap-4">
              {/* KABUPATEN */}
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">Kabupaten/Kota</Label>
                <Popover open={openKabupaten} onOpenChange={setOpenKabupaten}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between px-3 font-normal text-sm">
                       <span className="truncate">
                        {filters.kabupaten.length === 0 ? "Semua Kabupaten" : `${filters.kabupaten.length} Kabupaten Terpilih`}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[450px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Cari kabupaten..." />
                      <CommandList>
                        <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                           {dataWilayah.map((w) => (
                             <CommandItem key={w.kabupaten} value={w.kabupaten} onSelect={() => toggleKabupaten(w.kabupaten)}>
                                <div className={cn("mr-2 flex h-4 w-4 items-center justify-center border rounded-sm", 
                                   filters.kabupaten.includes(w.kabupaten) ? "bg-primary border-primary text-primary-foreground" : "opacity-50 border-slate-400"
                                )}>
                                   <Check className={cn("h-3 w-3", filters.kabupaten.includes(w.kabupaten) ? "opacity-100" : "opacity-0")} />
                                </div>
                                {w.kabupaten}
                             </CommandItem>
                           ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* FILTER KECAMATAN */}
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">Kecamatan</Label>
                <Popover open={openKecamatan} onOpenChange={setOpenKecamatan}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between px-3 font-normal text-sm">
                      <span className="truncate">
                        {filters.kecamatan.length === 0 ? "Pilih Kecamatan..." : `${filters.kecamatan.length} Kecamatan Terpilih`}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent   className="w-[450px] p-0"
                                    align="start"
                                    sideOffset={4}>
                    <Command className="h-full">
                      <CommandInput placeholder="Cari kecamatan..." />
                      <CommandList  className="h-[280px] overflow-y-auto overscroll-contain"
                                    onWheel={(e) => e.stopPropagation()}>
                        <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                        
                        {/* KEMBALIKAN DIV PEMBUNGKUS INI (SOLUSI PTK) */}
                        <div> 
                            {displayedWilayah.map((group) => (
                              <CommandGroup key={group.kabupaten} heading={group.kabupaten}>
                                {group.kecamatan?.map((kec) => (
                                  <CommandItem key={kec} value={kec} onSelect={() => toggleKecamatan(kec)}>
                                    <div className={cn("mr-2 flex h-4 w-4 items-center justify-center border rounded-sm", 
                                      filters.kecamatan.includes(kec) ? "bg-primary border-primary text-primary-foreground" : "opacity-50 border-slate-400"
                                    )}>
                                      <Check className={cn("h-3 w-3", filters.kecamatan.includes(kec) ? "opacity-100" : "opacity-0")} />
                                    </div>
                                    {kec}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            ))}
                        </div>

                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* BADGES */}
                {filters.kecamatan.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {filters.kecamatan.map((k) => (
                      <Badge key={k} variant="secondary" className="text-[10px] bg-slate-100 text-slate-700 border-slate-200 pointer-events-auto pr-1">
                        {k} 
                        <button className="ml-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleKecamatan(k); }}>
                          <XCircle className="h-3 w-3 text-slate-400 hover:text-red-500" />
                        </button>
                      </Badge>
                    ))}
                    <Button variant="ghost" size="sm" className="h-5 text-[10px] text-red-500 hover:bg-red-50" onClick={() => setFilters(prev => ({...prev, kecamatan: []}))}>
                      Reset Kec
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* === SECTION 2: KRITERIA PTK (SAMA) === */}
          <div className="space-y-3">
             <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
               <span className="h-4 w-1 bg-green-500 rounded-full"></span> Kriteria PTK
             </h4>
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Jenjang</Label>
                  <Select value={filters.jenjang} onValueChange={(val) => setFilters({...filters, jenjang: val === "ALL" ? "" : val})}>
                    <SelectTrigger><SelectValue placeholder="Semua" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua</SelectItem> <SelectItem value="PAUD">PAUD</SelectItem> <SelectItem value="SD">SD</SelectItem> <SelectItem value="SMP">SMP</SelectItem> <SelectItem value="SMA">SMA</SelectItem> <SelectItem value="SMK">SMK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Status Pelatihan</Label>
                  <Select value={filters.status} onValueChange={(val) => setFilters({...filters, status: val === "ALL" ? "" : val})}>
                    <SelectTrigger><SelectValue placeholder="Semua" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua</SelectItem><SelectItem value="sudah">Sudah Pelatihan</SelectItem><SelectItem value="belum">Belum Pelatihan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
             </div>
             <div className="space-y-2">
                <Label className="text-xs text-slate-500">Nama Sekolah</Label>
                <Popover open={openSekolah} onOpenChange={setOpenSekolah}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between h-9 px-3 font-normal text-slate-700">
                      <span className="truncate">{filters.sekolah ? filters.sekolah : "Ketik min 3 huruf..."}</span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput placeholder="Cari sekolah..." value={sekolahSearch} onValueChange={setSekolahSearch} />
                      <CommandList>
                        {loadingSekolah && <div className="p-4 text-xs text-center text-slate-500">Mencari...</div>}
                        {!loadingSekolah && sekolahOptions.length === 0 && sekolahSearch.length > 2 && <CommandEmpty>Sekolah tidak ditemukan.</CommandEmpty>}
                        <CommandGroup>
                        {sekolahOptions.map((item, idx) => (
                           <CommandItem key={idx} value={item.nama_sekolah} onSelect={() => { setFilters({...filters, sekolah: item.nama_sekolah}); setOpenSekolah(false); }}>
                             <Check className={cn("mr-2 h-4 w-4", filters.sekolah === item.nama_sekolah ? "opacity-100" : "opacity-0")} />
                             {item.nama_sekolah}
                           </CommandItem>
                        ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
             </div>
          </div>

          <Separator />

          {/* === SECTION 3: DIKLAT & FILTER (UPDATED) === */}
          <div className="space-y-4">
             {/* Mode Filter Switch */}
             <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                    <span className="h-4 w-1 bg-purple-500 rounded-full"></span> Filter Diklat
                </h4>
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                        onClick={() => setFilters({...filters, mode_filter: 'history'})}
                        className={cn("text-[10px] px-3 py-1.5 rounded-md transition-all font-medium", 
                            filters.mode_filter === 'history' ? "bg-white shadow text-blue-700" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Riwayat
                    </button>
                    <button
                        onClick={() => setFilters({...filters, mode_filter: 'eligible'})}
                        className={cn("text-[10px] px-3 py-1.5 rounded-md transition-all font-medium", 
                            filters.mode_filter === 'eligible' ? "bg-white shadow text-green-700" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Kandidat
                    </button>
                </div>
             </div>

            {/* Info Box */}
             <div className={cn("p-3 rounded-md text-xs border flex items-start gap-2", 
                filters.mode_filter === 'eligible' ? "bg-green-50 border-green-200 text-green-800" : "bg-blue-50 border-blue-200 text-blue-800"
             )}>
                <Info size={16} className="shrink-0 mt-0.5" />
                {filters.mode_filter === 'eligible' ? (
                     <p>Mencari guru yang <b>BELUM LULUS</b> diklat dengan kriteria di bawah ini.</p>
                ) : (
                     <p>Mencari guru yang <b>SUDAH LULUS</b> diklat dengan kriteria di bawah ini.</p>
                )}
             </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* --- FILTER BARU: Kategori & Program --- */}
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">Kategori Kegiatan</Label>
                <Select value={filters.kategori} onValueChange={(val) => setFilters({...filters, kategori: val === "ALL" ? "" : val})}>
                  <SelectTrigger><SelectValue placeholder="Semua Kategori" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua</SelectItem>
                    {KATEGORI_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-500">Sumber Program</Label>
                <Select value={filters.program} onValueChange={(val) => setFilters({...filters, program: val === "ALL" ? "" : val})}>
                  <SelectTrigger><SelectValue placeholder="Semua Program" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua</SelectItem>
                    {PROGRAM_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Judul Diklat */}
              <div className="space-y-2 sm:col-span-2">
                   <Label className={cn("text-xs", isDateSelected ? "text-slate-400" : "text-slate-500")}>
                        Judul Diklat (Multi Select)
                   </Label>
                   <Popover open={openDiklat} onOpenChange={setOpenDiklat}>
                      <PopoverTrigger asChild>
                        <Button disabled={isDateSelected} variant="outline" role="combobox" className="w-full justify-between px-3 h-auto min-h-[40px] font-normal text-slate-700 text-left">
                          <span className="truncate whitespace-normal">
                            {filters.judul_diklat.length === 0 
                                ? (isDateSelected ? "Terkunci (Mode Tanggal Aktif)" : "Ketik judul...") 
                                : `${filters.judul_diklat.length} Judul Terpilih`}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput placeholder="Ketik min 3 huruf..." value={diklatSearch} onValueChange={setDiklatSearch} />
                          <CommandList>
                             {loadingDiklat && <div className="p-4 text-xs text-center text-slate-500">Mencari...</div>}
                             {!loadingDiklat && diklatOptions.length === 0 && diklatSearch.length > 2 && <CommandEmpty>Diklat tidak ditemukan.</CommandEmpty>}
                             <CommandGroup>
                             {diklatOptions.map((item, idx) => (
                                <CommandItem key={idx} value={item.title} onSelect={() => toggleDiklat(item.title)}>
                                  <div className={cn("mr-2 flex h-4 w-4 items-center justify-center border rounded-sm", 
                                     filters.judul_diklat.includes(item.title) ? "bg-primary border-primary text-primary-foreground" : "opacity-50 border-slate-400"
                                  )}>
                                     <Check className={cn("h-3 w-3", filters.judul_diklat.includes(item.title) ? "opacity-100" : "opacity-0")} />
                                  </div>
                                  {item.title}
                                </CommandItem>
                             ))}
                             </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                   </Popover>
                   {filters.judul_diklat.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {filters.judul_diklat.map((t, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] bg-white border border-slate-200 pointer-events-auto pr-1 py-1">
                            <span className="mr-1">{t}</span>
                            <button className="shrink-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleDiklat(t); }}>
                               <XCircle size={14} className="text-slate-400 hover:text-red-500"/>
                            </button>
                          </Badge>
                        ))}
                         <Button variant="ghost" size="sm" className="h-6 text-[10px] text-red-500" onClick={() => setFilters(p => ({...p, judul_diklat: []}))}>Reset Judul</Button>
                      </div>
                   )}
              </div>

              {/* Tanggal */}
              <div className="space-y-2 sm:col-span-2">
                <Label className={cn("text-xs", isJudulSelected ? "text-slate-400" : "text-slate-500")}>
                    Rentang Tanggal
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} disabled={isJudulSelected} className={cn("w-full justify-start text-left font-normal", !filters.dateRange?.from && "text-muted-foreground", isJudulSelected ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange?.from ? (
                        filters.dateRange.to ? `${format(filters.dateRange.from, "dd MMM y", {locale:id})} - ${format(filters.dateRange.to, "dd MMM y", {locale:id})}` : format(filters.dateRange.from, "dd MMM y", {locale:id})
                      ) : <span>Pilih tanggal...</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar initialFocus mode="range" defaultMonth={filters.dateRange?.from} selected={filters.dateRange} onSelect={(range) => setFilters({...filters, dateRange: range})} numberOfMonths={2} locale={id} />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Rumpun */}
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">Rumpun</Label>
                <Select disabled={isDateSelected} value={filters.rumpun} onValueChange={(val) => setFilters({...filters, rumpun: val === "ALL" ? "" : val})}>
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
          
        </div>

        <DialogFooter className="flex justify-between w-full border-t pt-4 sticky bottom-0 bg-white">
          <Button type="button" variant="ghost" onClick={handleReset} className="text-slate-500 hover:text-red-600">Reset Semua</Button>
          <Button type="submit" onClick={handleApply} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">Terapkan Filter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}