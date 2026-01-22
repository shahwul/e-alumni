"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle, // <--- 1. PASTIKAN INI DI-IMPORT
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Building2, MapPin, GraduationCap, CheckCircle2, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function DetailPTKDialog({ open, onOpenChange, nik }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch data tiap kali dialog dibuka & NIK berubah
  useEffect(() => {
    if (open && nik) {
      setLoading(true);
      fetch(`/api/ptk/${nik}`)
        .then((res) => res.json())
        .then((result) => {
          setData(result);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [open, nik]);

  // Helper Initials Avatar
  const getInitials = (name) => {
    return name?.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white p-0 overflow-hidden text-left"> 
        
        {/* === SOLUSI ERROR === */}
        {/* Tambahkan DialogTitle dengan class 'sr-only' (hidden visual) */}
        {/* Ini memenuhi syarat aksesibilitas tanpa merusak desain */}
        <DialogTitle className="sr-only">
            Detail Profil PTK - {data?.profil?.nama || "Memuat..."}
        </DialogTitle>

        {/* HEADER WARNA (Custom Design Kamu) */}
        <div className="bg-slate-950 p-6 text-white flex flex-col items-center sm:flex-row sm:items-start gap-4">
           <Avatar className="h-16 w-16 border-2 border-white/20">
              <AvatarImage src="" /> 
              <AvatarFallback className="bg-blue-600 text-white font-bold text-xl">
                 {loading ? "..." : getInitials(data?.profil?.nama)}
              </AvatarFallback>
           </Avatar>
           <div className="flex-1 text-center sm:text-left space-y-1">
              {loading ? (
                <div className="h-6 w-32 bg-slate-800 animate-pulse rounded mx-auto sm:mx-0"></div>
              ) : (
                <>
                  <h3 className="text-lg font-bold leading-tight">{data?.profil?.nama}</h3>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-300 text-sm">
                     <span className="font-mono bg-slate-800 px-1.5 rounded text-xs">{data?.profil?.nik}</span>
                     <span>•</span>
                     <span className="capitalize">{data?.profil?.status_kepegawaian?.toLowerCase()}</span>
                  </div>
                </>
              )}
           </div>
        </div>

        {/* BODY CONTENT */}
        <div className="p-6">
          {loading ? (
             <div className="space-y-4 text-center text-slate-400 py-8">Loading data...</div>
          ) : (
             <div className="space-y-6">
                
                {/* 1. Detail Sekolah & Wilayah */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                         <p className="text-xs text-slate-500 font-medium">Unit Kerja</p>
                         <p className="text-sm font-semibold text-slate-800">{data?.profil?.nama_sekolah || "-"}</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                         <p className="text-xs text-slate-500 font-medium">Wilayah</p>
                         <p className="text-sm font-semibold text-slate-800">
                           {data?.profil?.kecamatan ? `${data?.profil?.kecamatan}, ${data?.profil?.kabupaten}` : "-"}
                         </p>
                      </div>
                   </div>
                </div>

                <Separator />

                {/* 2. Riwayat Diklat (Timeline Style) */}
                <div>
                   <h4 className="text-sm font-semibold flex items-center gap-2 mb-4">
                      <GraduationCap className="h-4 w-4" /> Riwayat Pelatihan
                   </h4>
                   
                   <ScrollArea className="h-[250px] pr-4">
                      {data?.history?.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                           Belum ada riwayat pelatihan.
                        </div>
                      ) : (
                        <div className="space-y-4 relative pl-2">
                           <div className="absolute left-2 top-2 bottom-2 w-[1px] bg-slate-200"></div>

                           {data?.history?.map((item, idx) => (
                              <div key={idx} className="relative pl-8">
                                 <div className={`absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-white 
                                    ${item.status_kelulusan === 'Lulus' ? 'bg-green-500' : 'bg-slate-300'}`}>
                                 </div>
                                 
                                 <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                                    <h5 className="font-semibold text-slate-800 text-sm mb-1">{item.judul_diklat}</h5>
                                    
                                    <div className="flex flex-wrap gap-y-1 gap-x-3 text-xs text-slate-500 mb-2">
                                       <span className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3" /> 
                                          {item.start_date ? format(new Date(item.start_date), "d MMM yyyy", {locale:id}) : "-"}
                                       </span>
                                       <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" /> {item.angkatan || "-"}
                                       </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                       <Badge variant="outline" className={
                                          item.status_kelulusan === 'Lulus' 
                                          ? "bg-green-50 text-green-700 border-green-200" 
                                          : "bg-red-50 text-red-700 border-red-200"
                                       }>
                                          {item.status_kelulusan === 'Lulus' ? (
                                             <><CheckCircle2 className="h-3 w-3 mr-1"/> Lulus</>
                                          ) : (
                                             <><XCircle className="h-3 w-3 mr-1"/> {item.status_kelulusan || 'Belum Lulus'}</>
                                          )}
                                       </Badge>
                                       {item.nilai_akhir && (
                                          <span className="text-xs font-bold text-slate-700">
                                             Nilai: {item.nilai_akhir}
                                          </span>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                      )}
                   </ScrollArea>
                </div>

             </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}