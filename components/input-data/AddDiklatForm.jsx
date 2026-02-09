"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar"; 
import { Calendar as CalendarIcon} from "lucide-react";
import { id, is } from "date-fns/locale";
import { format } from "date-fns";


//Valid atau nggaknya isi forom diatur di sini
const formSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter"), //nggak ada optional -> wajib diisi 
  description: z.string().optional(), //karena ditambahin optional -> ga dicek diisi atau nggaknya
  // kode_judul: z.string().min(1, "Wajib diisi"),
  start_date: z.string(),
  end_date: z.string(),
  jenis_perekrutan: z.string(),
  category_id: z.coerce.number(),
  mode_id: z.coerce.number(),
  education_level_id: z.coerce.number(),
  jenis_kegiatan: z.string(),
  jenis_program: z.string(),
  topic_id: z.coerce.number(),
  sub_topic_id: z.coerce.number(),
  occupation_id: z.coerce.number(),
  participant_limit: z.coerce.number(),
  total_jp: z.coerce.number(),
  location: z.string(),
});

export default function AddDiklatForm({onBack, onSuccess}) {
  //menghunbungkan zod tadi ke dalam useForm pake zodResolver
  const [isMounted, setIsMounted] = useState(false);
  const [options, setOptions] = useState({
    topik: [], subTopik: [], jenjang: [], moda: [], jabatan: [], kategori: []
  });

  // Mencegah Hydration Mismatch
  useEffect(() => {
    setIsMounted(true);
    async function fetchRefs() {
      const res = await fetch("/api/input-data");
      const data = await res.json();
      if (res.ok) setOptions(data);
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
      total_peserta:" " ,
      total_jp: " ",
      lokasi: "",
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
        alert("Sukses: " + result.message);
        // Send onSuccess
        onSuccess();
        // form.reset();
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.log("Koneksi Gagal:", error);
      alert("Koneksi gagal!");
    }
  };

  const onReset = () => {
    form.reset();
  };

  // Jangan render apapun sebelum mounted untuk menghindari mismatch pada date/calendar
  if (!isMounted) return null;

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
            <div className="grid grid-cols-1 gap-4 pt-4 border-t">
              <FormItem>
                <FormLabel>Kode Pelatihan</FormLabel>
                <FormControl><Input disabled placeholder="Auto-generated" className="bg-slate-100" /></FormControl>
              </FormItem>
            </div>

            {/* ROW 4: 4 Field (Tanggal) */}
            <div className="grid grid-cols-2 gap-4">
            {["start_date", "end_date"].map((name) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{name === "start_date" ? "Tanggal Mulai" : "Tanggal Selesai"}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(new Date(field.value), "dd MMM yyyy", { locale: id }) : <span>Pilih Tanggal</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          captionLayout="dropdown"
                          fromYear={2025}
                          toYear={2035}
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                          disabled={(date) => name === "end_date" && form.watch("start_date") ? date < new Date(form.watch("start_date")) : false}
                          initialFocus
                          locale={id}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
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
                      <SelectItem value="Terbuka">Terbuka</SelectItem>
                      <SelectItem value="Undangan">Undangan</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* ROW 6: 2 Field (50-50) */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <FormField
                control={form.control}
                name="jenis_kegiatan"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Jenis Kegiatan</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Pilih Jenis Program" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Non Pelatihan">Non Pelatihan</SelectItem>
                        <SelectItem value="Pelatihan">Pelatihan</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jenis_program"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Jenis Program</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Pilih Jenis Program" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Nasional">Nasional</SelectItem>
                        <SelectItem value="BBGTK DIY">BBGTK DIY</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* ROW 6: 2 Field (50-50) */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori Pelatihan</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {options.kategori.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>{item.category_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
              control={form.control}
              name="mode_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Moda Pelatihan</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Pilih Moda" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {options.moda.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.mode_name || item.mode_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>

            {/* ROW 7: 1 Field (Full Width) */}
            <FormField
                control={form.control}
                name="education_level_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sasaran Jenjang</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Pilih Sasaran Jenjang" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {options.jenjang.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>{item.level_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

            {/* ROW 8: 2 Field (50-50) */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="topic_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rumpun (Topik)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Pilih Rumpun" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {options.topik.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>{item.topic_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sub_topic_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub-Rumpun</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Pilih Sub-Rumpun" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {options.subTopik
                          .filter((st) => st.topic_id === Number(form.watch("topic_id")))
                          .map((item) => (
                            <SelectItem key={item.id} value={item.id.toString()}>{item.sub_topic_name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* ROW 9: 1 Field (Full Width) */}
            <FormField
                control={form.control}
                name="occupation_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sasaran Jabatan</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Pilih Sasaran Jabatan" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {options.jabatan.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>{item.occupation_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

            

            {/* ROW 10: 2 Field (50-50) */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="participant_limit"
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
              name="location"
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
          <Button onClick={onBack} variant="outline" type="button">Batal</Button>
          <Button type="submit">Simpan Data Pelatihan</Button>
        </div>
      </form>
    </Form>
  );
}