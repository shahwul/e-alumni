"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Icons
import { 
  Search, Plus, ChevronDown, ChevronUp, MapPin, Calendar, 
  Users, Edit2, Save, X, Clock, GraduationCap, Briefcase 
} from "lucide-react";

// --- FIX IMPORT PATHS ---
import AddDiklatForm from "@/components/input-data/AddDiklatForm"; 
import UploadPeserta from "@/components/input-data/UploadPeserta";
import ListPeserta from "@/components/input-data/ListPeserta";

// --- KOMPONEN CARD ITEM ---
function DiklatCard({ data, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...data });

  useEffect(() => { setEditData({ ...data }); }, [data]);

  const handleSaveEdit = async () => {
    try {
        const res = await fetch('/api/diklat', { 
            method: 'PUT',
            body: JSON.stringify(editData)
        });
        if(res.ok) {
            toast.success("Data berhasil diperbarui");
            setIsEditing(false);
            onRefresh();
        } else {
            toast.error("Gagal update data");
        }
    } catch(e) { toast.error("Error koneksi"); }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className={cn(
        "group border rounded-xl bg-white shadow-sm transition-all duration-200 hover:shadow-md", 
        expanded ? "ring-2 ring-blue-100 border-blue-300" : "border-slate-200"
    )}>
        {/* HEADER CARD */}
        <div 
            className="p-5 cursor-pointer" 
            onClick={() => !isEditing && setExpanded(!expanded)}
        >
            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-[10px] font-normal bg-slate-100 text-slate-600 border border-slate-200">
                            {data.rumpun || 'Umum'}
                        </Badge>
                        <Badge variant="outline" className={cn("text-[10px] font-medium border", 
                                data.moda === 'Daring' ? "text-blue-600 bg-blue-50 border-blue-200" : 
                                data.moda === 'Luring' ? "text-orange-600 bg-orange-50 border-orange-200" : 
                                "text-purple-600 bg-purple-50 border-purple-200"
                        )}>
                            {data.moda}
                        </Badge>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-blue-700 transition-colors">
                        {data.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-slate-400"/> 
                            <span>{formatDate(data.start_date)} - {formatDate(data.end_date)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Users className={cn("w-4 h-4", data.total_peserta > 0 ? "text-green-500" : "text-slate-400")}/>
                            <span className={data.total_peserta > 0 ? "text-slate-700 font-medium" : ""}>
                                {data.total_peserta > 0 ? `${data.total_peserta} Peserta` : "Belum ada peserta"}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-end pl-4 border-l border-slate-100">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600 rounded-full h-8 w-8">
                        {expanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                    </Button>
                </div>
            </div>
        </div>

        {/* EXPANDED CONTENT */}
        {expanded && (
            <div className="border-t bg-slate-50/50 cursor-default" onClick={(e) => e.stopPropagation()}>
                <Tabs defaultValue="list_peserta" className="w-full">
                    <div className="px-5 pt-4">
                        <TabsList className="grid w-full grid-cols-3 max-w-[500px] bg-slate-200/50">
                            <TabsTrigger value="list_peserta">Data Peserta</TabsTrigger>
                            <TabsTrigger value="upload">Upload / Import</TabsTrigger>
                            <TabsTrigger value="detail">Detail & Edit</TabsTrigger>
                        </TabsList>
                    </div>

                    <Separator className="mt-4 mb-4" />

                    <div className="px-5 pb-6">
                        {/* TAB 1: LIST PESERTA */}
                        <TabsContent value="list_peserta" className="mt-0 focus-visible:ring-0">
                             <ListPeserta diklatId={data.id} />
                        </TabsContent>

                        {/* TAB 2: UPLOAD */}
                        <TabsContent value="upload" className="mt-0 focus-visible:ring-0">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <UploadPeserta diklatId={data.id} onSuccess={onRefresh} />
                            </div>
                        </TabsContent>

                        {/* TAB 3: DETAIL */}
                        <TabsContent value="detail" className="mt-0 focus-visible:ring-0">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-base">Informasi Diklat</h4>
                                        <p className="text-sm text-slate-500">Detail pelaksanaan dan atribut pelatihan.</p>
                                    </div>
                                    {!isEditing ? (
                                        <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
                                            <Edit2 className="w-3.5 h-3.5"/> Edit Data
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setEditData({...data}); }}>
                                                <X className="w-3.5 h-3.5 mr-1"/> Batal
                                            </Button>
                                            <Button size="sm" className="bg-blue-600" onClick={handleSaveEdit}>
                                                <Save className="w-3.5 h-3.5 mr-1"/> Simpan
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Form Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Judul Pelatihan</Label>
                                            {isEditing ? (
                                                <Input value={editData.title} onChange={(e) => setEditData({...editData, title: e.target.value})} className="bg-slate-50" />
                                            ) : (
                                                <p className="font-medium text-slate-900">{data.title}</p>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Mulai</Label>
                                                {isEditing ? (
                                                    <Input type="date" value={editData.start_date?.split('T')[0]} onChange={(e) => setEditData({...editData, start_date: e.target.value})} />
                                                ) : (
                                                    <div className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-slate-400"/> {formatDate(data.start_date)}</div>
                                                )}
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Selesai</Label>
                                                {isEditing ? (
                                                    <Input type="date" value={editData.end_date?.split('T')[0]} onChange={(e) => setEditData({...editData, end_date: e.target.value})} />
                                                ) : (
                                                    <div className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-slate-400"/> {formatDate(data.end_date)}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Lokasi</Label>
                                            {isEditing ? (
                                                <Input value={editData.lokasi_kegiatan || ''} onChange={(e) => setEditData({...editData, lokasi_kegiatan: e.target.value})} />
                                            ) : (
                                                <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-slate-400"/> {data.lokasi_kegiatan || '-'}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total JP</Label>
                                                {isEditing ? (
                                                    <Input type="number" value={editData.total_jp || 0} onChange={(e) => setEditData({...editData, total_jp: e.target.value})} />
                                                ) : (
                                                    <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-slate-400"/> {data.total_jp || 0} JP</div>
                                                )}
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Kuota</Label>
                                                {isEditing ? (
                                                    <Input type="number" value={editData.participant_limit || 0} onChange={(e) => setEditData({...editData, participant_limit: e.target.value})} />
                                                ) : (
                                                    <div className="flex items-center gap-2 text-sm"><Users className="w-4 h-4 text-slate-400"/> {data.participant_limit || 0} Orang</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Jenjang Sasaran</Label>
                                            {isEditing ? (
                                                <Input value={editData.sasaran_jenjang || ''} onChange={(e) => setEditData({...editData, sasaran_jenjang: e.target.value})} />
                                            ) : (
                                                <div className="flex items-center gap-2 text-sm"><GraduationCap className="w-4 h-4 text-slate-400"/> {data.sasaran_jenjang || 'Semua'}</div>
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Jabatan Sasaran</Label>
                                            {isEditing ? (
                                                <Input value={editData.sasaran_jabatan || ''} onChange={(e) => setEditData({...editData, sasaran_jabatan: e.target.value})} />
                                            ) : (
                                                <div className="flex items-center gap-2 text-sm"><Briefcase className="w-4 h-4 text-slate-400"/> {data.sasaran_jabatan || 'Semua'}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        )}
    </div>
  )
}

// --- MAIN PAGE COMPONENT ---
export default function InputDataPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
        const res = await fetch(`/api/diklat?search=${search}&limit=50`);
        const json = await res.json();
        setData(json.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!isAdding) fetchData();
  }, [search, isAdding]);

  // VIEW 1: MODE TAMBAH (FULL PAGE FORM)
  if (isAdding) {
      return (
          <div className="container mx-auto py-8 max-w-5xl">
             <AddDiklatForm 
                onBack={() => setIsAdding(false)} 
                onSuccess={() => { setIsAdding(false); fetchData(); }} 
             />
          </div>
      );
  }

  // VIEW 2: LIST DASHBOARD (DEFAULT)
  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-6">
       <div className="flex justify-between items-end">
           <div>
               <h1 className="text-3xl font-bold text-slate-900">Input Data Diklat</h1>
               <p className="text-slate-500">Kelola jadwal pelatihan dan data peserta.</p>
           </div>
           <Button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700">
               <Plus className="mr-2 h-4 w-4"/> Tambah Pelatihan
           </Button>
       </div>

       {/* Search Bar */}
       <div className="relative">
           <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/>
           <Input 
                placeholder="Cari judul pelatihan..." 
                className="pl-10 bg-white" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
           />
       </div>

       {/* List Data */}
       <div className="space-y-4 min-h-[400px]">
           {loading ? (
                <div className="space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse" />)}
                </div>
           ) : data.length > 0 ? (
               data.map(item => (
                   <DiklatCard key={item.id} data={item} onRefresh={fetchData} />
               ))
           ) : (
               <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-3">
                        <Search className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Data tidak ditemukan</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mt-1 mb-4">
                        Belum ada pelatihan yang sesuai dengan pencarian Anda.
                    </p>
               </div>
           )}
       </div>
    </div>
  );
}