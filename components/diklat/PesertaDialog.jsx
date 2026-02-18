"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Import Button
import { Loader2, Download } from "lucide-react"; // Import Icon Download

export function PesertaDialog({ open, onOpenChange, diklatId, judulDiklat }) {
  const [peserta, setPeserta] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch Data Peserta
  useEffect(() => {
    if (open && diklatId) {
      setLoading(true);
      fetch(`/api/diklat/${diklatId}/peserta`)
        .then((res) => res.json())
        .then((data) => {
          setPeserta(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Gagal load peserta:", err);
          setLoading(false);
        });
    } else {
      setPeserta([]);
    }
  }, [open, diklatId]);

  // Handler Export
  const handleExport = () => {
    if (!diklatId) return;
    // Buka endpoint export di tab baru (otomatis download)
    window.open(`/api/diklat/${diklatId}/peserta/export`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:w-fit sm:max-w-[90vw] max-h-[85vh] overflow-hidden flex flex-col gap-4">
        
        {/* HEADER DENGAN TOMBOL EXPORT */}
        <DialogHeader className="flex flex-row items-start justify-between gap-4 pr-8">
          <div className="space-y-1 text-left">
            <DialogTitle>Daftar Peserta</DialogTitle>
            <p className="text-sm text-slate-500 max-w-md line-clamp-2">
              {judulDiklat}
            </p>
          </div>
          
          {/* TOMBOL EXPORT */}
          {!loading && peserta.length > 0 && (
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2 shrink-0"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-slate-400 h-8 w-8" />
          </div>
        ) : (
          <div className="relative w-full overflow-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="w-[50px] text-center font-bold">No</TableHead>
                  <TableHead className="min-w-[200px] font-bold">Nama PTK</TableHead>
                  <TableHead className="min-w-[200px] font-bold">Unit Kerja</TableHead>
                  <TableHead className="w-[100px] text-center font-bold">Nilai</TableHead>
                  <TableHead className="w-[120px] text-center font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {peserta.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-slate-500">
                      Belum ada peserta terdaftar.
                    </TableCell>
                  </TableRow>
                ) : (
                  peserta.map((p, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50">
                      <TableCell className="text-center">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900">{p.nama_ptk}</div>
                        <div className="text-xs text-slate-500">{p.nik}</div>
                      </TableCell>
                      <TableCell className="text-slate-600">{p.nama_sekolah}</TableCell>
                      <TableCell className="text-center font-medium">
                        {p.nilai_akhir || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={p.status_kelulusan === 'Lulus' ? 'default' : 'destructive'}
                          className={
                            p.status_kelulusan === 'Lulus' 
                              ? "bg-green-600 hover:bg-green-700" 
                              : "bg-red-600 hover:bg-red-700"
                          }
                        >
                          {p.status_kelulusan}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}