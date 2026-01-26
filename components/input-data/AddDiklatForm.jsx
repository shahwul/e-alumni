"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Untuk memanggil API input-data
async function onSubmit(values) {
  try {
    // Panggil API yang sudah kita buat tadi
    const response = await fetch("/api/input-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values), // 'values' berisi semua inputan form sesuai Zod
    });

    const result = await response.json();

    if (response.ok) {
      alert("Sukses: " + result.message); // Munculkan pesan sukses
      form.reset();         // Kosongkan form setelah berhasil
    } else {
        alert("Error: " + result.error);
    }
  } catch (error) {
    console.error("Gagal menyambung ke server:", error);
    alert("Koneksi gagal!");
  }
}

//Valid atau nggaknya isi forom diatur di sini
const formSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter"), //nggak ada optional -> wajib diisi 
  description: z.string().optional(), //karena ditambahin optional -> ga dicek diisi atau nggaknya
  kode_judul: z.string().min(1, "Wajib diisi"),
  start_date: z.string(),
  end_date: z.string(),
  jenis_perekrutan: z.string(),
  kategori: z.string(),
  moda: z.string(),
  jenjang: z.string(),
  rumpun: z.string(),
  sub_rumpun: z.string(),
  sasaran: z.string(),
  total_peserta: z.coerce.number(),
  total_jp: z.coerce.number(),
  lokasi: z.string(),
});

export function AddDiklatForm() {
  //menghunbungkan zod tadi ke dalam useForm pake zodResolver
  const form = useForm({
    resolver: zodResolver(formSchema), //ngecek input vs ketentuan di formSchema
    defaultValues: {
      title: "",
      total_peserta: 0,
      total_jp: 0,
    },
  });

  async function onSubmit(values) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informasi Dasar Pelatihan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* ROW 1: 2 Field (50-50) */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul Pelatihan</FormLabel>
                    <FormControl><Input placeholder="Masukkan judul..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Judul Singkat (Auto)</FormLabel>
                <FormControl><Input disabled placeholder="Auto-generated" className="bg-slate-100" /></FormControl>
              </FormItem>
            </div>

            {/* ROW 2: 1 Field (Full Width) */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl><Textarea placeholder="Masukkan deskripsi pelatihan..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ROW 3: 2 Field (50-50) */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <FormItem>
                <FormLabel>Kode Pelatihan</FormLabel>
                <FormControl><Input disabled placeholder="Auto-generated" className="bg-slate-100" /></FormControl>
              </FormItem>
              <FormField
                control={form.control}
                name="kode_judul"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Judul</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ROW 4: 4 Field (Tanggal) */}
            <div className="grid grid-cols-2 gap-4">
              {["start_date", "end_date"].map((name, i) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{["Tgl Mulai", "Tgl Selesai"][i]}</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* ROW 5: 1 Field (Full Width) */}
            <FormField
              control={form.control}
              name="jenis_perekrutan"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Jenis Perekrutan Peserta</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Pilih Jenis" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="terbuka">Terbuka</SelectItem>
                      <SelectItem value="undangan">Undangan</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* ROW 6: 2 Field (50-50) */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <FormField
                control={form.control}
                name="kategori"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Kategori Pelatihan</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Pilih Kategori" /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="fungsional">Fungsional</SelectItem></SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="moda"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Moda Pelatihan</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Pilih Moda" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Daring">Daring</SelectItem>
                        <SelectItem value="Luring">Luring</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* ROW 7: 1 Field (Full Width) */}
            <FormField
              control={form.control}
              name="jenjang"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Jenjang Sekolah</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Pilih Jenjang" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="SD">SD</SelectItem>
                      <SelectItem value="SMP">SMP</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* ROW 8: 2 Field (50-50) */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rumpun"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rumpun</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Pilih Rumpun" /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="teknis">Teknis</SelectItem></SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sub_rumpun"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub-Rumpun</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Pilih Sub-Rumpun" /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="it">IT</SelectItem></SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* ROW 9: 1 Field (Full Width) */}
            <FormField
              control={form.control}
              name="sasaran"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Sasaran Jabatan</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Pilih Jabatan" /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="guru">Guru</SelectItem></SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* ROW 10: 2 Field (50-50) */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="total_peserta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Peserta</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="total_jp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Jam Pelajaran (JP)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* ROW 11: 1 Field (Full Width) */}
            <FormField
              control={form.control}
              name="lokasi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokasi Kegiatan</FormLabel>
                  <FormControl><Input placeholder="Contoh: Jakarta / Zoom" {...field} /></FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button">Batal</Button>
          <Button type="submit">Simpan Data Pelatihan</Button>
        </div>
      </form>
    </Form>
  );
}