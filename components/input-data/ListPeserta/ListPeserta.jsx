// components/list-peserta/index.jsx
"use client";

import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, UserX } from "lucide-react";
import { usePesertaLogic } from "./usePesertaLogic";
import { PesertaRow } from "./PesertaRow";

export default function ListPeserta({ diklatId, onSuccess }) {
  const {
    data, loading, search, setSearch,
    editingId, editForm, setEditForm, isSaving,
    validationStatus, validatingField,
    handleEditClick, handleCancelEdit, handleSaveEdit, handleDelete
  } = usePesertaLogic(diklatId, onSuccess);

  return (
    <div className="space-y-4">
      {/* Header Search */}
      <div className="flex items-center justify-between gap-4">
         <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
                placeholder="Cari nama, NIK, atau sekolah..." 
                className="pl-9 h-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
         </div>
         <div className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
            Total: <b>{data.length}</b> Peserta
         </div>
      </div>

      {/* Table Data */}
      <div className="border rounded-md max-h-[600px] overflow-auto bg-white relative shadow-sm">
        <Table>
            <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <TableRow>
                    <TableHead className="w-[50px] text-center">No</TableHead>
                    <TableHead className="min-w-[200px]">Identitas (NIK & Nama)</TableHead>
                    <TableHead className="min-w-[150px]">Pangkat</TableHead>
                    <TableHead className="min-w-[200px]">Unit Kerja (NPSN)</TableHead>
                    <TableHead className="text-right w-[100px]">Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-40 text-center text-slate-500">
                             <div className="flex flex-col items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                                <span className="text-xs">Memuat data peserta...</span>
                             </div>
                        </TableCell>
                    </TableRow>
                ) : data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-40 text-center text-slate-500">
                             <UserX className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                             <p className="text-sm">Data tidak ditemukan.</p>
                        </TableCell>
                    </TableRow>
                ) : (
                    data.map((row, idx) => (
                        <PesertaRow 
                            key={row.id}
                            row={row}
                            index={idx}
                            isEditing={editingId === row.id}
                            editForm={editForm}
                            setEditForm={setEditForm}
                            validationStatus={validationStatus}
                            validatingField={validatingField}
                            isSaving={isSaving}
                            onEditClick={handleEditClick}
                            onCancelEdit={handleCancelEdit}
                            onSaveEdit={handleSaveEdit}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </TableBody>
        </Table>
      </div>
    </div>
  );
}