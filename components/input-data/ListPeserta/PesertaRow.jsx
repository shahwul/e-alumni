// components/list-peserta/PesertaRow.jsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit2, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ValidatedInput } from "./ValidatedInput";
import { cn } from "@/lib/utils";

export function PesertaRow({ 
    row, index, isEditing, 
    editForm, setEditForm, 
    validationStatus, validatingField, isSaving, 
    onEditClick, onCancelEdit, onSaveEdit, onDelete 
}) {

  const handleChange = (field, value) => {
      setEditForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <TableRow className={isEditing ? "bg-blue-50/40" : "hover:bg-slate-50 transition-colors"}>
      <TableCell className="text-xs text-slate-500 text-center align-top pt-4">{index + 1}</TableCell>

      {isEditing ? (
        /* --- MODE EDIT --- */
        <TableCell colSpan={3} className="p-4 align-top">
          <div className="flex flex-col gap-4 bg-white p-4 rounded-md border border-blue-100 shadow-sm">
            {/* Baris 1: NIK & Nama */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ValidatedInput 
                    label="NIK (Cek Database)" field="nik" 
                    value={editForm.nik} onChange={handleChange} 
                    placeholder="16 Digit NIK" 
                    isLoading={validatingField === 'nik'} status={validationStatus.nik}
                />
                <div className="space-y-1">
                    <Label className="text-[10px] text-slate-500 uppercase font-semibold">Nama Peserta</Label>
                    <Input value={editForm.nama_peserta || ''} onChange={(e) => handleChange('nama_peserta', e.target.value)} className="h-8 text-xs bg-white" />
                </div>
            </div>

            {/* Baris 2: Jabatan & Pangkat */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label className="text-[10px] text-slate-500 uppercase font-semibold">Jabatan</Label>
                    <Input value={editForm.snapshot_jabatan || ''} onChange={(e) => handleChange('snapshot_jabatan', e.target.value)} className="h-8 text-xs bg-white" />
                </div>
                <div className="space-y-1">
                    <Label className="text-[10px] text-slate-500 uppercase font-semibold">Golongan</Label>
                    <Input value={editForm.snapshot_pangkat || ''} onChange={(e) => handleChange('snapshot_pangkat', e.target.value)} className="h-8 text-xs bg-white" />
                </div>
            </div>

            {/* Baris 3: NPSN & Sekolah */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                    <ValidatedInput 
                        label="NPSN" field="npsn" 
                        value={editForm.npsn} onChange={handleChange} 
                        placeholder="8 Digit NPSN" 
                        isLoading={validatingField === 'npsn'} status={validationStatus.npsn}
                    />
                </div>
                <div className="col-span-8 space-y-1">
                    <Label className="text-[10px] text-slate-500 uppercase font-semibold">Nama Sekolah (Auto)</Label>
                    <Input value={editForm.nama_sekolah || ''} readOnly disabled className="h-8 text-xs bg-slate-100 text-slate-600 cursor-not-allowed" placeholder="Otomatis terisi..." />
                </div>
            </div>
          </div>
        </TableCell>
      ) : (
        /* --- MODE VIEW --- */
        <>
          <TableCell className="align-top pt-3">
            <div className="flex flex-col">
                <span className="font-semibold text-sm text-slate-800">{row.nama_peserta}</span>
                <span className="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded w-fit mt-1">{row.nik}</span>
            </div>
          </TableCell>
          <TableCell className="align-top pt-3">
            <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-700">{row.snapshot_jabatan || '-'}</span>
                {row.snapshot_pangkat && <Badge variant="outline" className="w-fit text-[10px] h-5 font-normal text-slate-500 border-slate-300">{row.snapshot_pangkat}</Badge>}
            </div>
          </TableCell>
          <TableCell className="align-top pt-3">
            <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-700">{row.nama_sekolah}</span>
                <span className="text-[10px] text-slate-400">NPSN: {row.npsn || '-'}</span>
            </div>
          </TableCell>
        </>
      )}

      {/* --- ACTION BUTTONS --- */}
      <TableCell className="text-right align-top pt-3">
        {isEditing ? (
            <div className="flex flex-col gap-2 items-end">
                <Button 
                    size="sm" 
                    className={cn("h-8 w-[80px]", (!validationStatus.nik.isValid || !validationStatus.npsn.isValid) ? "bg-slate-300 cursor-not-allowed text-slate-500" : "bg-blue-600 hover:bg-blue-700")}
                    onClick={onSaveEdit} 
                    disabled={isSaving || !validationStatus.nik.isValid || !validationStatus.npsn.isValid}
                >
                    {isSaving ? <Loader2 className="h-3 w-3 animate-spin"/> : "Simpan"}
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-[80px] text-slate-500" onClick={onCancelEdit}>Batal</Button>
            </div>
        ) : (
            <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => onEditClick(row)}>
                    <Edit2 className="h-4 w-4" />
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Peserta?</AlertDialogTitle>
                            <AlertDialogDescription>Data <b>{row.nama_peserta}</b> akan dihapus permanen.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => onDelete(row.id)}>Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        )}
      </TableCell>
    </TableRow>
  );
}