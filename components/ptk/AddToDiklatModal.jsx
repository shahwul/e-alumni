"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AddToDiklatModal({ isOpen, onClose, selectedNiks, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [diklatOptions, setDiklatOptions] = useState([]);
  const [selectedDiklat, setSelectedDiklat] = useState("");

  // Load daftar diklat saat modal dibuka
  useEffect(() => {
    if (isOpen) {
        fetch('/api/diklat/kandidat') 
            .then(res => res.json())
            .then(json => setDiklatOptions(json.data || []));
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!selectedDiklat) {
        toast.error("Pilih diklat tujuan dulu!");
        return;
    }

    setLoading(true);
    try {
        const res = await fetch('/api/diklat/kandidat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                diklat_id: selectedDiklat,
                nik_list: selectedNiks
            })
        });

        if (res.ok) {
            toast.success(`Berhasil menambahkan ${selectedNiks.length} guru ke kandidat.`);
            if (onSuccess) onSuccess(); 
            onClose();
        } else {
            toast.error("Gagal menyimpan data.");
        }
    } catch (e) {
        toast.error("Terjadi kesalahan koneksi.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Kandidat Peserta</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
                Anda memilih <strong>{selectedNiks.length}</strong> orang Guru/PTK untuk ditambahkan sebagai calon peserta.
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Pilih Diklat Tujuan</label>
                <Select onValueChange={setSelectedDiklat} value={selectedDiklat}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih Jadwal Diklat..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                        {diklatOptions.map(d => (
                            <SelectItem key={d.id} value={d.id.toString()}>
                                {d.title} (Mulai: {new Date(d.start_date).toLocaleDateString('id-ID')})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>

        <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={loading}>Batal</Button>
            <Button onClick={handleSubmit} disabled={loading || !selectedDiklat}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Kandidat
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}