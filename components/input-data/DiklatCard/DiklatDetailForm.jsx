"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Calendar as CalendarIcon, MapPin, Clock, Users, Edit2, Save, X, GraduationCap, 
  Briefcase, AlignLeft, Tag, Layers, SearchCode, Monitor, Shapes 
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils"; // Pastikan util ini ada

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MODA_OPTIONS, JENIS_KEGIATAN_OPTIONS, PROGRAM_OPTIONS, PEREKRUTAN_OPTIONS } from "@/components/input-data/helpers/constant";

const DataField = ({ label, icon: Icon, isEditing, children, viewValue, className = "" }) => (
  <div className={`space-y-1.5 ${className}`}>
    <Label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{label}</Label>
    {isEditing ? children : (
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700 min-h-[20px]">
        {Icon && <Icon className="w-4 h-4 text-slate-400 shrink-0" />}
        <span>{viewValue || "-"}</span>
      </div>
    )}
  </div>
);

export default function DiklatDetailForm({ data, isEditing, setIsEditing, editData, setEditData, handleSaveEdit }) {
  const [refs, setRefs] = useState({ topics: [], categories: [], levels: [], jobs: [] });
  const [subTopics, setSubTopics] = useState([]);

  // Fetch Global Refs
  useEffect(() => {
    const fetchAll = async () => {
      const endpoints = ["rumpun", "kategori", "jenjang", "jabatan"];
      const results = await Promise.all(endpoints.map(e => fetch(`/api/ref/${e}`).then(r => r.json())));
      setRefs({ topics: results[0], categories: results[1], levels: results[2], jobs: results[3] });
    };
    fetchAll();
  }, []);

  // Fetch Sub-Topics (Reactive)
  const fetchSub = useCallback(async (id) => {
    if (!id) return setSubTopics([]);
    const res = await fetch(`/api/ref/sub-rumpun?topic_id=${id}`);
    if (res.ok) setSubTopics(await res.json());
  }, []);

  useEffect(() => {
    fetchSub(isEditing ? editData.topic_id : data.topic_id);
  }, [isEditing, editData.topic_id, data.topic_id, fetchSub]);

  // Helpers
  const findLabel = (arr, id, key) => arr.find(i => i.id === id)?.[key] || "-";
  const updateEdit = (key, val) => setEditData(prev => ({ ...prev, [key]: val }));
  const fmtDate = (d) => d ? format(new Date(d), "dd MMM yyyy", { locale: localeId }) : "-";

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-start border-b pb-4">
        <div>
          <h4 className="font-bold text-slate-800 text-lg">Detail Pelatihan</h4>
          <p className="text-sm text-slate-500">Atribut teknis pelaksanaan pelatihan.</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </Button>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setEditData({ ...data }); }}>
                <X className="w-3.5 h-3.5 mr-1" /> Batal
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveEdit}>
                <Save className="w-3.5 h-3.5 mr-1" /> Simpan
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        {/* KOLOM KIRI */}
        <div className="space-y-6">
          <DataField label="Judul Pelatihan" isEditing={isEditing} viewValue={data.title}>
            <Input value={editData.title || ""} onChange={e => updateEdit("title", e.target.value)} className="bg-slate-50" />
          </DataField>

          <div className="grid grid-cols-2 gap-4">
            {/* MULAI - Calendar Shadcn */}
            <DataField label="Mulai" icon={CalendarIcon} isEditing={isEditing} viewValue={fmtDate(data.start_date)}>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal bg-slate-50", !editData.start_date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editData.start_date ? format(new Date(editData.start_date), "dd/MM/yyyy") : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editData.start_date ? new Date(editData.start_date) : undefined}
                    onSelect={(date) => updateEdit("start_date", date?.toISOString())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </DataField>

            {/* SELESAI - Calendar Shadcn */}
            <DataField label="Selesai" icon={CalendarIcon} isEditing={isEditing} viewValue={fmtDate(data.end_date)}>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal bg-slate-50", !editData.end_date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editData.end_date ? format(new Date(editData.end_date), "dd/MM/yyyy") : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editData.end_date ? new Date(editData.end_date) : undefined}
                    onSelect={(date) => updateEdit("end_date", date?.toISOString())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </DataField>
          </div>

          <DataField label="Deskripsi" isEditing={isEditing} viewValue={data.description} icon={AlignLeft}>
            <Textarea value={editData.description || ""} onChange={e => updateEdit("description", e.target.value)} className="bg-slate-50 min-h-[120px]" />
          </DataField>
        </div>

        {/* KOLOM KANAN */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <DataField label="Jenis Kegiatan" icon={Tag} isEditing={isEditing} viewValue={data.jenis_kegiatan?.replace(/_/g, " ") || "-"}>
              <Select value={editData.jenis_kegiatan} onValueChange={v => updateEdit("jenis_kegiatan", v)}>
                <SelectTrigger className="bg-slate-50"><SelectValue /></SelectTrigger>
                <SelectContent>{JENIS_KEGIATAN_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </DataField>

            <DataField label="Kategori" icon={Shapes} isEditing={isEditing} viewValue={findLabel(refs.categories, data.category_id, "category_name")}>
              <Select value={String(editData.category_id)} onValueChange={v => updateEdit("category_id", Number(v))}>
                <SelectTrigger className="bg-slate-50"><SelectValue /></SelectTrigger>
                <SelectContent>{refs.categories.map(o => <SelectItem key={o.id} value={String(o.id)}>{o.category_name}</SelectItem>)}</SelectContent>
              </Select>
            </DataField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DataField label="Program" icon={Layers} isEditing={isEditing} viewValue={data.jenis_program?.replace(/_/g, " ")}>
              <Select value={editData.jenis_program} onValueChange={v => updateEdit("jenis_program", v)}>
                <SelectTrigger className="bg-slate-50"><SelectValue /></SelectTrigger>
                <SelectContent>{PROGRAM_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </DataField>
            <DataField label="Moda" icon={Monitor} isEditing={isEditing} viewValue={data.moda}>
              <Select value={String(editData.mode_id)} onValueChange={v => updateEdit("mode_id", Number(v))}>
                <SelectTrigger className="bg-slate-50"><SelectValue /></SelectTrigger>
                <SelectContent>{MODA_OPTIONS.map(o => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </DataField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DataField label="Perekrutan" icon={SearchCode} isEditing={isEditing} viewValue={data.jenis_perekrutan}>
              <Select value={editData.jenis_perekrutan} onValueChange={v => updateEdit("jenis_perekrutan", v)}>
                <SelectTrigger className="bg-slate-50"><SelectValue /></SelectTrigger>
                <SelectContent>{PEREKRUTAN_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </DataField>
            <DataField label="JP" icon={Clock} isEditing={isEditing} viewValue={`${data.total_jp} JP`}>
              <Input type="number" value={editData.total_jp || 0} onChange={e => updateEdit("total_jp", Number(e.target.value))} className="bg-slate-50" />
            </DataField>
          </div>

          <DataField label="Sasaran" isEditing={isEditing} viewValue={`${findLabel(refs.levels, data.education_level_id, "level_name")} - ${findLabel(refs.jobs, data.occupation_id, "occupation_name")}`}>
            <div className="grid grid-cols-2 gap-4">
              <Select value={String(editData.education_level_id)} onValueChange={v => updateEdit("education_level_id", Number(v))}>
                <SelectTrigger className="bg-slate-50"><SelectValue placeholder="Jenjang" /></SelectTrigger>
                <SelectContent>{refs.levels.map(o => <SelectItem key={o.id} value={String(o.id)}>{o.level_name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={String(editData.occupation_id)} onValueChange={v => updateEdit("occupation_id", Number(v))}>
                <SelectTrigger className="bg-slate-50"><SelectValue placeholder="Jabatan" /></SelectTrigger>
                <SelectContent>{refs.jobs.map(o => <SelectItem key={o.id} value={String(o.id)}>{o.occupation_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </DataField>

          <DataField label="Topik Materi" isEditing={isEditing} viewValue={`${findLabel(refs.topics, data.topic_id, "topic_name")} / ${findLabel(subTopics, data.sub_topic_id, "sub_topic_name")}`}>
            <div className="grid grid-cols-2 gap-4">
              <Select value={String(editData.topic_id)} onValueChange={v => { updateEdit("topic_id", Number(v)); updateEdit("sub_topic_id", null); }}>
                <SelectTrigger className="bg-slate-50"><SelectValue placeholder="Rumpun" /></SelectTrigger>
                <SelectContent>{refs.topics.map(o => <SelectItem key={o.id} value={String(o.id)}>{o.topic_name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={String(editData.sub_topic_id)} onValueChange={v => updateEdit("sub_topic_id", Number(v))} disabled={!editData.topic_id}>
                <SelectTrigger className="bg-slate-50"><SelectValue placeholder="Sub" /></SelectTrigger>
                <SelectContent>{subTopics.map(o => <SelectItem key={o.id} value={String(o.id)}>{o.sub_topic_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </DataField>
        </div>
      </div>
    </div>
  );
}