"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Edit2,
  Save,
  X,
  GraduationCap,
  Briefcase,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { JENJANG_OPTIONS, JABATAN_OPTIONS } from "@/components/input-data/helpers/constant";

export default function DiklatDetailForm({
  data,
  isEditing,
  setIsEditing,
  editData,
  setEditData,
  handleSaveEdit,
}) {
  // State untuk Rumpun (Dynamic Fetch)
  const [rumpunOptions, setRumpunOptions] = useState([]);
  const [subRumpunOptions, setSubRumpunOptions] = useState([]);

  useEffect(() => {
    if (isEditing && rumpunOptions.length === 0) {
      const fetchRefs = async () => {
        try {
          const resTopic = await fetch("/api/ref/rumpun");
          const dataTopic = await resTopic.json();
          setRumpunOptions(dataTopic);

          const resSub = await fetch("/api/ref/sub-rumpun");
          const dataSub = await resSub.json();
          setSubRumpunOptions(dataSub);
        } catch (e) {
          console.error("Gagal load referensi");
        }
      };
      fetchRefs();
    }
  }, [isEditing]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-slate-800 text-base">
            Informasi Diklat
          </h4>
          <p className="text-sm text-slate-500">
            Detail pelaksanaan dan atribut pelatihan.
          </p>
        </div>

        {!isEditing ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="gap-2"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit Data
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                setEditData({ ...data });
              }}
            >
              <X className="w-3.5 h-3.5 mr-1" /> Batal
            </Button>
            <Button
              size="sm"
              className="bg-blue-600"
              onClick={handleSaveEdit}
            >
              <Save className="w-3.5 h-3.5 mr-1" /> Simpan
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* KOLOM KIRI */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">
              Judul Pelatihan
            </Label>
            {isEditing ? (
              <Input
                value={editData.title}
                onChange={(e) =>
                  setEditData({ ...editData, title: e.target.value })
                }
                className="bg-slate-50"
              />
            ) : (
              <p className="font-medium text-slate-900">{data.title}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                Mulai
              </Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={editData.start_date?.split("T")[0]}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      start_date: e.target.value,
                    })
                  }
                />
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {formatDate(data.start_date)}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                Selesai
              </Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={editData.end_date?.split("T")[0]}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      end_date: e.target.value,
                    })
                  }
                />
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {formatDate(data.end_date)}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">
              Lokasi
            </Label>
            {isEditing ? (
              <Input
                value={editData.location || ""}
                onChange={(e) =>
                  setEditData({ ...editData, location: e.target.value })
                }
              />
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-slate-400" />
                {data.location || "-"}
              </div>
            )}
          </div>

          {isEditing && (
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                Rumpun Materi
              </Label>
              <Select
                value={editData.topic_id ? String(editData.topic_id) : ""}
                onValueChange={(val) =>
                  setEditData({
                    ...editData,
                    topic_id: Number(val),
                  })
                }
              >
                <SelectTrigger className="bg-slate-50">
                  <SelectValue placeholder="Pilih Rumpun" />
                </SelectTrigger>
                <SelectContent>
                  {rumpunOptions.map((opt) => (
                    <SelectItem key={opt.id} value={String(opt.id)}>
                      {opt.topic_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* KOLOM KANAN */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                Total JP
              </Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editData.total_jp || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      total_jp: e.target.value,
                    })
                  }
                />
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {data.total_jp || 0} JP
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                Kuota
              </Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editData.participant_limit || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      participant_limit: e.target.value,
                    })
                  }
                />
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-slate-400" />
                  {data.participant_limit || 0} Orang
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">
              Jenjang Sasaran
            </Label>
            {isEditing ? (
              <Select
                value={editData.education_level_id || ""}
                onValueChange={(val) =>
                  setEditData({
                    ...editData,
                    education_level_id: val,
                  })
                }
              >
                <SelectTrigger className="bg-slate-50">
                  <SelectValue placeholder="Pilih Jenjang" />
                </SelectTrigger>
                <SelectContent>
                  {JENJANG_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="w-4 h-4 text-slate-400" />
                {data.sasaran_jenjang || "Semua"}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">
              Jabatan Sasaran
            </Label>
            {isEditing ? (
              <Select
                value={editData.occupation_id || ""}
                onValueChange={(val) =>
                  setEditData({
                    ...editData,
                    occupation_id: val,
                  })
                }
              >
                <SelectTrigger className="bg-slate-50">
                  <SelectValue placeholder="Pilih Jabatan" />
                </SelectTrigger>
                <SelectContent>
                  {JABATAN_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="w-4 h-4 text-slate-400" />
                {data.sasaran_jabatan || "Semua"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
