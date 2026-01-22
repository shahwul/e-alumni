"use client";

import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export function PesertaDialog({ open, onOpenChange, diklatId, judulDiklat }) {
  const [peserta, setPeserta] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && diklatId) {
      setLoading(true);
      fetch(`/api/diklat/${diklatId}/peserta`)
        .then(res => res.json())
        .then(data => {
            setPeserta(data);
            setLoading(false);
        });
    }
  }, [open, diklatId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Daftar Peserta</DialogTitle>
          <p className="text-sm text-slate-500">{judulDiklat}</p>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Nama PTK</TableHead>
                <TableHead>Sekolah</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {peserta.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center">Belum ada peserta.</TableCell></TableRow>
              ) : (
                peserta.map((p, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                        <div className="font-medium">{p.nama_ptk}</div>
                        <div className="text-xs text-slate-400">{p.nik}</div>
                    </TableCell>
                    <TableCell>{p.nama_sekolah}</TableCell>
                    <TableCell>{p.nilai_akhir || '-'}</TableCell>
                    <TableCell>
                        <Badge variant={p.status_kelulusan === 'Lulus' ? 'default' : 'destructive'}>
                            {p.status_kelulusan}
                        </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}