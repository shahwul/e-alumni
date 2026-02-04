"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, Trash2, Save, X, Edit2, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ListPeserta({ diklatId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // State untuk Editing
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Data
  const fetchPeserta = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/input-data/peserta?diklat_id=${diklatId}&search=${search}`);
      const json = await res.json();
      setData(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(fetchPeserta, 500);
    return () => clearTimeout(timer);
  }, [search, diklatId]);

  // Handle Edit Click
  const handleEditClick = (peserta) => {
    setEditingId(peserta.id);
    setEditForm({ ...peserta });
  };

  // Handle Cancel Edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Handle Save Edit
  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/input-data/peserta', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      
      if (res.ok) {
        toast.success("Data peserta diperbarui");
        setEditingId(null);
        fetchPeserta(); // Refresh list
      } else {
        toast.error("Gagal update data");
      }
    } catch (e) {
      toast.error("Error koneksi");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/input-data/peserta?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Peserta dihapus dari daftar");
        fetchPeserta();
      }
    } catch (e) {
      toast.error("Gagal menghapus");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Search */}
      <div className="flex items-center justify-between gap-4">
         <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
                placeholder="Cari nama, NIK, atau sekolah..." 
                className="pl-9 h-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
         </div>
         <div className="text-xs text-slate-500 font-medium">
            Total: {data.length} Peserta
         </div>
      </div>

      {/* Table Data */}
      <div className="border rounded-md max-h-[400px] overflow-auto bg-white relative">
        <Table>
            <TableHeader className="bg-slate-50 sticky top-0 z-10">
                <TableRow>
                    <TableHead className="w-[50px]">No</TableHead>
                    <TableHead>Nama & NIK</TableHead>
                    <TableHead>Pangkat & Golongan</TableHead>
                    <TableHead>NPSN & Sekolah</TableHead>
                    <TableHead className="text-right w-[100px]">Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                             <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                             Memuat data...
                        </TableCell>
                    </TableRow>
                ) : data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                             <UserX className="h-8 w-8 mx-auto mb-2 opacity-20" />
                             Belum ada peserta di database. <br/> Silakan upload data di tab "Upload Peserta".
                        </TableCell>
                    </TableRow>
                ) : (
                    data.map((row, idx) => {
                        const isEditing = editingId === row.id;

                        return (
                           <TableRow key={row.id} className={isEditing ? "bg-blue-50/30" : "hover:bg-slate-50"}>
                            <TableCell className="text-xs text-slate-500 w-[50px] align-top pt-4">{idx + 1}</TableCell>
                            
                            {/* JIKA EDITING: Gabungkan Kolom menjadi Layout Form mini */}
                            {isEditing ? (
                                <TableCell colSpan={3} className="p-4 align-top">
                                    <div className="grid grid-cols-12 gap-4">
                                            {/* Kolom 1: NIK & Nama (Lebar 5/12) */}
                                            <div className="col-span-12 md:col-span-5 space-y-3">
                                                <div>
                                                    <Label className="text-[10px] text-slate-500 uppercase">NIK</Label>
                                                    <Input 
                                                        value={editForm.nik || ''} 
                                                        onChange={(e) => setEditForm({...editForm, nik: e.target.value})} 
                                                        className="h-8 text-xs bg-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-[10px] text-slate-500 uppercase">Nama Peserta</Label>
                                                    <Input 
                                                        value={editForm.nama_peserta || ''} 
                                                        onChange={(e) => setEditForm({...editForm, nama_peserta: e.target.value})} 
                                                        className="h-8 text-xs bg-white font-medium"
                                                    />
                                                </div>
                                            </div>

                                            {/* Kolom 2: Jabatan & Golongan (Lebar 3/12) */}
                                            <div className="col-span-12 md:col-span-3 space-y-3">
                                                <div>
                                                    <Label className="text-[10px] text-slate-500 uppercase">Jabatan (Saat Diklat)</Label>
                                                    <Input 
                                                        value={editForm.snapshot_jabatan || ''} 
                                                        onChange={(e) => setEditForm({...editForm, snapshot_jabatan: e.target.value})} 
                                                        className="h-8 text-xs bg-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-[10px] text-slate-500 uppercase">Golongan</Label>
                                                    <Input 
                                                        value={editForm.snapshot_pangkat || ''} 
                                                        onChange={(e) => setEditForm({...editForm, snapshot_pangkat: e.target.value})} 
                                                        className="h-8 text-xs bg-white"
                                                    />
                                                </div>
                                            </div>

                                            {/* Kolom 3: NPSN & Sekolah (Lebar 4/12) */}
                                            <div className="col-span-12 md:col-span-4 space-y-3">
                                                <div>
                                                    <Label className="text-[10px] text-slate-500 uppercase">NPSN</Label>
                                                    <Input 
                                                        value={editForm.npsn || ''} 
                                                        onChange={(e) => setEditForm({...editForm, npsn: e.target.value})} 
                                                        className="h-8 text-xs bg-white w-[100px]"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-[10px] text-slate-500 uppercase">Nama Sekolah</Label>
                                                    <Input 
                                                        value={editForm.snapshot_nama_sekolah || ''} 
                                                        onChange={(e) => setEditForm({...editForm, snapshot_nama_sekolah: e.target.value})} 
                                                        className="h-8 text-xs bg-white"
                                                    />
                                                </div>
                                            </div>
                                    </div>
                                </TableCell>
                            ) : (
                                /* TAMPILAN VIEW BIASA (READ ONLY) */
                                <>
                                    <TableCell className="align-top py-3">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium text-sm text-slate-900">
                                                {row.nama_peserta}
                                            </span>
                                            <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded w-fit">
                                                {row.nik}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell className="align-top py-3">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-xs text-slate-700">{row.snapshot_jabatan || '-'}</span>
                                            {row.snapshot_pangkat && (
                                                <Badge variant="outline" className="w-fit text-[10px] h-5 px-1.5 font-normal text-slate-500">
                                                    {row.snapshot_pangkat}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell className="align-top py-3">
                                        <div className="flex flex-col">
                                                <span className="text-xs font-semibold text-slate-700">{row.snapshot_nama_sekolah}</span>
                                                <span className="text-[10px] text-slate-500">NPSN: {row.npsn || '-'}</span>
                                        </div>
                                    </TableCell>
                                </>
                            )}

                            {/* KOLOM AKSI (Consolidated) */}
                            <TableCell className="text-right align-top pt-4 w-[100px]">
                                    {isEditing ? (
                                        <div className="flex flex-col gap-2 items-end">
                                            <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 w-full" onClick={handleSaveEdit} disabled={isSaving}>
                                                {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-1"/> : <Save className="h-3 w-3 mr-1" />}
                                                Simpan
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-8 w-full text-slate-500" onClick={handleCancelEdit}>
                                                Batal
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => handleEditClick(row)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                {/* ... Content Alert Dialog ... */}
                                            </AlertDialog>
                                        </div>
                                    )}
                            </TableCell>
                            </TableRow>
                        );
                    })
                )}
            </TableBody>
        </Table>
      </div>
    </div>
  );
}