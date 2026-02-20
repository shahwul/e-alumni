"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, FileSpreadsheet, Loader2, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { generateAndDownloadExcel } from "./utils/export-excel";

export default function ListKandidat({ diklatId, diklatTitle, onSuccess }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await fetch(`/api/diklat/${diklatId}/kandidat`);
      const json = await res.json();
      setData(json.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat data kandidat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (diklatId) fetchData();
  }, [diklatId]);

  const handleSaveToAlumni = async () => {
    if (data.length === 0) return;
    if (!confirm(`Yakin ingin memindahkan ${data.length} kandidat ini ke daftar peserta alumni?`)) return;

    setIsSaving(true);
    try {
        const res = await fetch(`/api/diklat/${diklatId}/alumni`, {
            method: 'POST',
        });
        
        const json = await res.json();

        if (res.ok) {
            toast.success(json.message);
            fetchData(true); 
            if (onSuccess) onSuccess(true); 
        } else {
            toast.error(json.error || "Gagal menyimpan");
        }
    } catch (e) {
        console.error(e);
        toast.error("Terjadi kesalahan sistem");
    } finally {
        setIsSaving(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await generateAndDownloadExcel(data, diklatTitle);
    } catch (e) {
      toast.error("Gagal export data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async (kandidatId) => {
    if (!confirm("Hapus guru ini dari daftar kandidat?")) return;
    
    try {
        const res = await fetch(`/api/diklat/${diklatId}/kandidat?kandidat_id=${kandidatId}`, { method: 'DELETE' });
        if (res.ok) {
            toast.success("Kandidat dihapus");
            fetchData(true);
            if (onSuccess) onSuccess(true);
        }
    } catch(e) { toast.error("Gagal menghapus"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border">
        <div>
            <h4 className="font-bold text-slate-800 text-sm">Daftar Kandidat / Calon Peserta</h4>
            <p className="text-xs text-slate-500">Total: {data.length} Orang</p>
        </div>
        <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => fetchData(false)} title="Refresh">
                <RefreshCw className="w-4 h-4"/>
            </Button>
            <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 text-white" 
                title="Tambahkan ke Alumni"
                onClick={handleSaveToAlumni}
                disabled={isSaving || data.length === 0}
            >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2"/>}
                {isSaving ? "Menyimpan..." : "Simpan ke Alumni"}
            </Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleExport} disabled={data.length === 0 || isExporting}>
                {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <FileSpreadsheet className="w-4 h-4 mr-2"/>}
                Export Excel
            </Button>
        </div>
      </div>

      <div className="rounded-md border bg-white overflow-hidden min-h-[200px]">
        <Table>
            <TableHeader className="bg-slate-100">
                <TableRow>
                    <TableHead className="w-[50px] text-center">No</TableHead>
                    <TableHead>Nama PTK</TableHead>
                    <TableHead>Unit Kerja</TableHead>
                    <TableHead>Jabatan</TableHead>
                    <TableHead>Mata Pelajaran</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-12"><Loader2 className="animate-spin mx-auto text-slate-400"/></TableCell></TableRow>
                ) : data.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-500 italic">Belum ada kandidat dipilih.</TableCell></TableRow>
                ) : (
                    data.map((row, idx) => (
                        <TableRow key={row.kandidat_id} className="hover:bg-slate-50/50">
                            <TableCell className="text-center text-xs text-slate-500">{idx + 1}</TableCell>
                            <TableCell>
                                <div className="font-medium text-sm text-slate-900">{row.nama_ptk}</div>
                                <div className="text-[10px] font-mono text-slate-400">{row.nik || "NIK: -"}</div>
                            </TableCell>
                            <TableCell className="text-xs text-slate-600">{row.nama_sekolah}</TableCell>
                            <TableCell className="text-xs text-slate-600">{row.jabatan_ptk}</TableCell>
                            <TableCell className="text-xs text-slate-600">{row.riwayat_sertifikasi || "-"}</TableCell>
                            <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50" 
                                  onClick={() => handleDelete(row.kandidat_id)}
                                >
                                    <Trash2 className="w-4 h-4"/>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
      </div>
    </div>
  );
}