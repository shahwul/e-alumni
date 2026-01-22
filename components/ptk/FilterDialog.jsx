"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Filter, Check, ChevronsUpDown, XCircle, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, sub } from "date-fns";
import { Calendar } from "@/components/ui/calendar"; 
import { id } from "date-fns/locale";

// ID Rumpun harus sesuai database (ref_topik)
const LIST_RUMPUN = [
  { id: "1", label: "Substansi" },
  { id: "2", label: "Pedagogi" },
  { id: "3", label: "TIK" },
  { id: "4", label: "Teknis" },
];

export function FilterDialog({ onApplyFilter }) {
  const [open, setOpen] = useState(false);
  
  // --- STATE UTAMA FILTER ---
  const [filters, setFilters] = useState({
    kabupaten: [],
    kecamatan: [],
    jenjang: "",
    status: "",
    sekolah: "",
    judul_diklat: "",
    rumpun: "",
    sub_rumpun: "",
    dateRange: { from: undefined, to: undefined }
  });

  // --- STATE DATA MASTER ---
  const [dataWilayah, setDataWilayah] = useState([]); // Data dari API Wilayah
  
  // State Popover & Search
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

  // 1. FETCH WILAYAH SAAT MOUNT (GANTI HARDCODE)
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

  // 2. SEARCH SEKOLAH (AUTOFILL)
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

  // 3. SEARCH DIKLAT (AUTOFILL)
  useEffect(() => {
    // Kalau input kosong, reset opsi
    if (!diklatSearch) { 
        setDiklatOptions([]); 
        return; 
    }

    const timer = setTimeout(async () => {
      if (diklatSearch.length > 2) {
        setLoadingDiklat(true);
        try {
          // Buat URL Params dinamis
          const params = new URLSearchParams();
          params.append("q", diklatSearch);

          // Kalau user udah milih Rumpun, kirim ID-nya
          if (filters.rumpun && filters.rumpun !== "ALL") {
             params.append("topic_id", filters.rumpun);
          }
          
          // Kalau user udah milih Sub Rumpun, kirim ID-nya
          if (filters.sub_rumpun && filters.sub_rumpun !== "ALL") {
             params.append("sub_topic_id", filters.sub_rumpun);
          }

          const res = await fetch(`/api/diklat/search?${params.toString()}`);
          
          if(res.ok) {
              setDiklatOptions(await res.json());
          }
        } catch (e) { 
            console.error(e); 
        } finally { 
            setLoadingDiklat(false); 
        }
      }
    }, 500);

    return () => clearTimeout(timer);

  }, [diklatSearch, filters.rumpun, filters.sub_rumpun]);

  // Fetch Sub Rumpun kalau Rumpun dipilih
  useEffect(() => {
    // Kalau Rumpun kosong/ALL, reset Sub Rumpun
    if (!filters.rumpun || filters.rumpun === "ALL") {
        setSubRumpunOptions([]);
        setFilters(prev => ({ ...prev, sub_rumpun: "" }));
        return;
    }

    async function fetchSub() {
      try {
        const res = await fetch(`/api/ref/sub-rumpun?topic_id=${filters.rumpun}`);
        if (res.ok) {
            setSubRumpunOptions(await res.json());
        }
      } catch (e) { console.error(e); }
    }
    
    // Reset pilihan sub_rumpun saat induknya berubah, lalu fetch baru
    setFilters(prev => ({ ...prev, sub_rumpun: "" }));
    fetchSub();

  }, [filters.rumpun]);

  // --- HANDLER FUNCTIONS ---
  
  // 1. Toggle Kabupaten (Logic Baru Multi Select)
  const toggleKabupaten = (namaKab) => {
    setFilters((prev) => {
      const current = prev.kabupaten;
      const isSelected = current.includes(namaKab);
      let newKabupaten;
      
      if (isSelected) {
        newKabupaten = current.filter((k) => k !== namaKab);
      } else {
        newKabupaten = [...current, namaKab];
      }

      // Opsional: Kalau Kabupaten di-uncheck, kecamatan di dalamnya mau dihapus gak?
      // Kalau mau simpel, biarin aja. Nanti user hapus sendiri.
      return { ...prev, kabupaten: newKabupaten };
    });
  };

  const toggleKecamatan = (namaKecamatan) => {
    setFilters((prev) => {
      const current = prev.kecamatan;
      if (current.includes(namaKecamatan)) {
        return { ...prev, kecamatan: current.filter((k) => k !== namaKecamatan) };
      } else {
        return { ...prev, kecamatan: [...current, namaKecamatan] };
      }
    });
  };

  const handleReset = () => {
    const empty = {
      kabupaten: [], kecamatan: [], jenjang: "", status: "", sekolah: "",
      judul_diklat: "", rumpun: "", sub_rumpun: "", dateRange: { from: undefined, to: undefined }
    };
    setFilters(empty);
    onApplyFilter(empty);
  };

  const handleApply = () => {
    onApplyFilter(filters);
    setOpen(false);
  };

  // Logic: Filter opsi kecamatan berdasarkan kabupaten yang dipilih
  // Jika 'ALL' atau kosong, tampilkan semua grouped data.
    const displayedWilayah = filters.kabupaten.length > 0
    ? dataWilayah.filter(w => filters.kabupaten.includes(w.kabupaten))
    : dataWilayah;

  // Hitung jumlah aktif
     const activeCount = [
     filters.jenjang, filters.status, filters.sekolah, 
     filters.judul_diklat, filters.rumpun, filters.sub_rumpun, filters.dateRange?.from
    ].filter(Boolean).length + filters.kecamatan.length + filters.kabupaten.length;

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
      
      <DialogContent className="sm:max-w-[500px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Data PTK</DialogTitle>
          <DialogDescription>Saring data berdasarkan wilayah, sekolah, atau riwayat.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          
          {/* === SECTION 1: WILAYAH === */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
              <span className="h-4 w-1 bg-blue-600 rounded-full"></span> Wilayah
            </h4>
            
            <div className="flex flex-col gap-4">
              {/* 1. KABUPATEN (MULTI SELECT) */}
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">Kabupaten/Kota (Bisa pilih banyak)</Label>
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
                           {/* Loop Data Wilayah ambil Kabupatennya aja */}
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

                {/* Badge Kabupaten */}
                {filters.kabupaten.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {filters.kabupaten.map((k) => (
                      <Badge 
                        key={k} 
                        variant="secondary" 
                        className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 pointer-events-auto pr-1" // Tambah pointer-events-auto & padding kanan
                      >
                        {k} 
                        <button
                          className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation(); // Stop klik biar gak nembus
                            toggleKabupaten(k);
                          }}
                        >
                          <XCircle className="h-3 w-3 text-blue-400 hover:text-red-500" />
                        </button>
                      </Badge>
                    ))}
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-5 text-[10px] text-red-500 hover:bg-red-50" 
                        onClick={() => setFilters(prev => ({...prev, kabupaten: []}))}
                    >
                        Reset Kab
                    </Button>
                  </div>
                )}
              </div>

{/* 2. KECAMATAN (MULTI SELECT - DEPENDENT) */}
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
                  <PopoverContent className="w-[450px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Cari kecamatan..." />
                      <CommandList>
                        <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                        <div className="max-h-[300px] overflow-y-auto">
                            {/* Loop displayedWilayah (yang sudah terfilter berdasarkan kabupaten yg dipilih) */}
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

                {/* Badge Kecamatan */}
                {filters.kecamatan.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {filters.kecamatan.map((k) => (
                      <Badge 
                        key={k} 
                        variant="secondary" 
                        className="text-[10px] bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 pointer-events-auto pr-1"
                      >
                        {k} 
                        <button
                          className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation(); 
                            toggleKecamatan(k);
                          }}
                        >
                          <XCircle className="h-3 w-3 text-slate-400 hover:text-red-500" />
                        </button>
                      </Badge>
                    ))}
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-5 text-[10px] text-red-500 hover:bg-red-50" 
                        onClick={() => setFilters(prev => ({...prev, kecamatan: []}))}
                    >
                        Reset Kec
                    </Button>
                  </div>
                )}
              </div>

            </div>
          </div>

          <Separator />

          {/* === SECTION 2: SEKOLAH & STATUS === */}
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
                      <SelectItem value="ALL">Semua</SelectItem><SelectItem value="PAUD">PAUD</SelectItem> 
                      <SelectItem value="SD">SD</SelectItem> <SelectItem value="SMP">SMP</SelectItem> 
                      <SelectItem value="SMA">SMA</SelectItem> <SelectItem value="SMK">SMK</SelectItem> <SelectItem value="Semua Jenjang">Semua Jenjang</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Status Pelatihan</Label>
                  <Select value={filters.status} onValueChange={(val) => setFilters({...filters, status: val === "ALL" ? "" : val})}>
                    <SelectTrigger><SelectValue placeholder="Semua" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua</SelectItem>
                      <SelectItem value="sudah">Sudah Pelatihan</SelectItem>
                      <SelectItem value="belum">Belum Pelatihan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
             </div>
             {/* Search Sekolah */}
             <div className="space-y-2">
                <Label className="text-xs text-slate-500">Nama Sekolah (Autofill)</Label>
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

          {/* === SECTION 3: DIKLAT & TANGGAL === */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
              <span className="h-4 w-1 bg-purple-500 rounded-full"></span> Riwayat Diklat
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Filter Tanggal */}
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs text-slate-500">Rentang Tanggal Pelaksanaan</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !filters.dateRange?.from && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange?.from ? (
                        filters.dateRange.to ? 
                        `${format(filters.dateRange.from, "dd MMM y", {locale:id})} - ${format(filters.dateRange.to, "dd MMM y", {locale:id})}` : 
                        format(filters.dateRange.from, "dd MMM y", {locale:id})
                      ) : <span>Pilih tanggal...</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar initialFocus mode="range" defaultMonth={filters.dateRange?.from} selected={filters.dateRange} onSelect={(range) => setFilters({...filters, dateRange: range})} numberOfMonths={2} locale={id} />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Judul Diklat */}
              <div className="space-y-2 sm:col-span-2">
                   <Label className="text-xs text-slate-500">Judul Diklat (Autofill)</Label>
                   <Popover open={openDiklat} onOpenChange={setOpenDiklat}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between px-3 h-9 font-normal text-slate-700">
                          <span className="truncate">{filters.judul_diklat ? filters.judul_diklat : "Ketik judul..."}</span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
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
                                <CommandItem key={idx} value={item.title} onSelect={() => { setFilters({...filters, judul_diklat: item.title}); setOpenDiklat(false); }}>
                                  <Check className={cn("mr-2 h-4 w-4", filters.judul_diklat === item.title ? "opacity-100" : "opacity-0")} />
                                  {item.title}
                                </CommandItem>
                             ))}
                             </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                   </Popover>
              </div>
  
              {/* Rumpun & Sub Rumpun */}
              <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                
                {/* RUMPUN (INDUK) */}
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Rumpun / Topik</Label>
                  <Select 
                    value={filters.rumpun} 
                    onValueChange={(val) => setFilters({...filters, rumpun: val === "ALL" ? "" : val})}
                  >
                    <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua</SelectItem>
                      {LIST_RUMPUN.map((r) => (<SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>

                {/* SUB RUMPUN (ANAK) */}
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Sub Rumpun</Label>
                  <Select 
                    disabled={!filters.rumpun || filters.rumpun === "ALL"} // Disable kalau belum pilih induk
                    value={filters.sub_rumpun} 
                    onValueChange={(val) => setFilters({...filters, sub_rumpun: val === "ALL" ? "" : val})}
                  >
                    <SelectTrigger>
                        <SelectValue placeholder={filters.rumpun ? "Pilih Sub..." : "-"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua Sub</SelectItem>
                      {subRumpunOptions.map((sub) => (
                        // Pastikan value diconvert ke String biar aman
                        <SelectItem key={sub.id} value={String(sub.id)}>{sub.sub_topic_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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