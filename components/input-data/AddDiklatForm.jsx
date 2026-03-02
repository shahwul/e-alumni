"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { FormInput, FormSelect, FormDatePicker } from "@/components/ui/form-helpers";

const formSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter"),
  description: z.string().optional(),
  kode_judul: z.string().optional(),
  start_date: z.string().min(1, "Wajib diisi"),
  end_date: z.string().min(1, "Wajib diisi"),
  jenis_perekrutan: z.string().min(1, "Wajib dipilih"),
  category_id: z.coerce.number().min(1, "Wajib dipilih"),
  mode_id: z.coerce.number().min(1, "Wajib dipilih"),
  education_level_id: z.coerce.number().min(1, "Wajib dipilih"),
  jenis_kegiatan: z.string().min(1, "Wajib dipilih"),
  jenis_program: z.string().min(1, "Wajib dipilih"),
  topic_id: z.coerce.number().min(1, "Wajib dipilih"),
  sub_topic_id: z.coerce.number().min(1, "Wajib dipilih"),
  occupation_id: z.coerce.number().min(1, "Wajib dipilih"),
  participant_limit: z.coerce.number().min(1, "Wajib diisi"),
  total_jp: z.coerce.number().min(1, "Wajib diisi"),
  location: z.string().min(3, "Lokasi wajib diisi"),
});

export default function AddDiklatForm({ onBack, onSuccess }) {
  const [isMounted, setIsMounted] = useState(false);
  const [options, setOptions] = useState({
    topik: [], subTopik: [], jenjang: [], moda: [], jabatan: [], kategori: []
  });
  const [alertConfig, setAlertConfig] = useState({ open: false, title: "", message: "", isSuccess: false });

  const showAlert = (title, message, isSuccess = false) => {
    setAlertConfig({ open: true, title, message, isSuccess });
  };

  const handleAlertClose = (open) => {
    if (!open) {
      setAlertConfig(prev => ({ ...prev, open: false }));
      if (alertConfig.isSuccess) onSuccess();
    }
  };

  useEffect(() => {
    setIsMounted(true);
    async function fetchRefs() {
      try {
        const res = await fetch("/api/input-data");
        const data = await res.json();
        if (res.ok) setOptions(data);
      } catch (err) {
        console.error("Gagal load opsi:", err);
      }
    }
    fetchRefs();
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      kode_judul: "",
      start_date: "",
      end_date: "",
      jenis_perekrutan: "",
      jenis_kegiatan: "",
      jenis_program: "",
      location: "",
      participant_limit: "",
      total_jp: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      const response = await fetch("/api/input-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();
      if (response.ok) {
        showAlert("Sukses", result.message, true);
      } else {
        showAlert("Gagal", result.error || "Gagal menyimpan data", false);
      }
    } catch (error) {
      console.log("Koneksi Gagal:", error);
      showAlert("Error", "Koneksi gagal!", false);
    }
  };

  if (!isMounted) return null;

  const filteredSubTopik = options.subTopik.filter(
    (st) => st.topic_id === Number(form.watch("topic_id"))
  );

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Dasar Pelatihan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* ROW 1: Judul & Kode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput control={form.control} name="title" label="Judul Pelatihan" placeholder="Masukkan judul..." />
                <FormInput control={form.control} name="kode_judul" label="Judul Singkat (Auto)" placeholder="Auto-generated" disabled />
              </div>

              {/* ROW 2: Deskripsi */}
              <FormInput control={form.control} name="description" label="Deskripsi" placeholder="Masukkan deskripsi pelatihan..." isTextarea />

              {/* ROW 3: Tanggal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <FormDatePicker control={form.control} name="start_date" label="Tanggal Mulai" />
                <FormDatePicker control={form.control} name="end_date" label="Tanggal Selesai" minDate={form.watch("start_date")} />
              </div>

              {/* ROW 4: Perekrutan & Jenjang */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <FormSelect
                  control={form.control} name="jenis_perekrutan" label="Jenis Perekrutan" placeholder="Pilih Jenis"
                  options={[{ id: 'Terbuka', label: 'Terbuka' }, { id: 'Undangan', label: 'Undangan' }]}
                />
                <FormSelect
                  control={form.control} name="education_level_id" label="Sasaran Jenjang" placeholder="Pilih Jenjang"
                  options={options.jenjang} labelKey="level_name"
                />
              </div>

              {/* ROW 5: Jenis Kegiatan & Program */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  control={form.control} name="jenis_kegiatan" label="Jenis Kegiatan" placeholder="Pilih..."
                  options={[{ id: 'Non_Pelatihan', label: 'Non Pelatihan' }, { id: 'Pelatihan', label: 'Pelatihan' }]}
                />
                <FormSelect
                  control={form.control} name="jenis_program" label="Jenis Program" placeholder="Pilih..."
                  options={[{ id: 'Nasional', label: 'Nasional' }, { id: 'BBGTK_DIY', label: 'BBGTK DIY' }]}
                />
              </div>

              {/* ROW 6: Kategori & Moda */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <FormSelect
                  control={form.control} name="category_id" label="Kategori" placeholder="Pilih Kategori"
                  options={options.kategori} labelKey="category_name"
                />
                <FormSelect
                  control={form.control} name="mode_id" label="Moda" placeholder="Pilih Moda"
                  options={options.moda} labelKey="mode_name"
                />
              </div>

              {/* ROW 7: Rumpun & Sub-Rumpun */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  control={form.control} name="topic_id" label="Rumpun (Topik)" placeholder="Pilih Rumpun"
                  options={options.topik} labelKey="topic_name"
                  onChangeCustom={() => form.setValue("sub_topic_id", "")}
                />
                <FormSelect
                  control={form.control} name="sub_topic_id" label="Sub-Rumpun" placeholder="Pilih Sub-Rumpun"
                  options={filteredSubTopik} labelKey="sub_topic_name"
                />
              </div>

              {/* ROW 8: Jabatan */}
              <FormSelect
                control={form.control} name="occupation_id" label="Sasaran Jabatan" placeholder="Pilih Jabatan"
                options={options.jabatan} labelKey="occupation_name"
              />

              {/* ROW 9: Angka (Peserta & JP) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <FormInput control={form.control} name="participant_limit" label="Kuota Peserta" type="number" placeholder="0" />
                <FormInput control={form.control} name="total_jp" label="Total JP" type="number" placeholder="0" />
              </div>

              {/* ROW 10: Lokasi */}
              <FormInput control={form.control} name="location" label="Lokasi Kegiatan" placeholder="Contoh: Gedung A / Zoom Meeting" />

            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="flex justify-end gap-4 sticky bottom-0 bg-white/80 p-4 border-t backdrop-blur-sm">
            <Button onClick={onBack} variant="outline" type="button">Batal</Button>
            <Button type="submit">Simpan Data Pelatihan</Button>
          </div>
        </form>
      </Form>

      <AlertDialog open={alertConfig.open} onOpenChange={handleAlertClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertConfig.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => handleAlertClose(false)} className="bg-blue-600 hover:bg-blue-700">OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}