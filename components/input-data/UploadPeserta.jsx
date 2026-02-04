"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Upload, Save, Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw, Trash2, ArrowRightLeft, CloudUpload, FileSpreadsheet, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function UploadPeserta({ diklatId, onSuccess }) {
  const [parsedData, setParsedData] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validationDone, setValidationDone] = useState(false);
  const [needsRevalidation, setNeedsRevalidation] = useState(false);
  
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const hasData = parsedData.length > 0;

  // 1. Download Template (Lengkap dengan Jabatan/Golongan)
  const handleDownloadTemplate = () => {
    const header = [
        { "NIK": "1234567890", "Nama": "Nama Lengkap", "NPSN": "12345678", "Jabatan": "Guru Kelas", "Golongan": "III/a" }
    ];
    const ws = XLSX.utils.json_to_sheet(header);
    const range = XLSX.utils.decode_range(ws['!ref']); // Ambil area data (A1:E2)

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        
        // Skip kalau sel kosong
        if (!ws[cellRef]) continue;

        // Paksa tipe data jadi String ('s')
        ws[cellRef].t = 's';
        
        // Paksa format sel jadi Text ('@')
        // Efeknya: Ada segitiga hijau kecil di pojok kiri atas sel Excel (Number stored as text)
        ws[cellRef].z = '@'; 
      }
    }
    
    // 4. Atur Lebar Kolom (Biar NIK gak sempit-sempitan)
    ws['!cols'] = [
        { wch: 25 }, // Lebar Kolom NIK
        { wch: 30 }, // Lebar Kolom Nama
        { wch: 15 }, // Lebar Kolom NPSN
        { wch: 20 }, // Lebar Kolom Jabatan
        { wch: 10 }, // Lebar Kolom Golongan
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template_Peserta_Diklat.xlsx");
  };

  // 2. Logic Proses File
  const processFile = (file) => {
    if (!file) return;
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
        toast.error("Format file harus Excel (.xlsx / .xls)");
        return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const arrayBuffer = evt.target.result;
        const wb = XLSX.read(arrayBuffer, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(ws);

        if (rawData.length === 0) { toast.error("File Excel kosong"); return; }

        const dataWithId = rawData.map((d, i) => ({ ...d, _tempId: i }));
        setParsedData(dataWithId);
        setValidationDone(false);
        setNeedsRevalidation(false);
        validateData(dataWithId);
      } catch (err) { console.error(err); toast.error("Gagal membaca file Excel"); }
    };
    reader.readAsArrayBuffer(file);
  };

  // Event Handlers Drag & Drop
  const handleFileChange = (e) => processFile(e.target.files[0]);
  const handleDragOver = (e) => { e.preventDefault(); if (!hasData) setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (hasData) return;
    if (e.dataTransfer.files?.length > 0) processFile(e.dataTransfer.files[0]);
  };

  // 3. Validasi ke Server
  const validateData = async (dataToValidate) => {
    setIsValidating(true);
    try {
      const res = await fetch("/api/input-data/validate", {
          method: "POST",
          body: JSON.stringify({ peserta: dataToValidate })
      });
      const json = await res.json();
      if (json.data) {
          setParsedData(json.data);
          setValidationDone(true);
          setNeedsRevalidation(false);
          toast.success("Validasi selesai.");
      }
    } catch (err) { toast.error("Error validasi server"); } 
    finally { setIsValidating(false); }
  };

  // 4. Handle Edit Cell
  const handleCellChange = (index, field, value) => {
    const newData = [...parsedData];
    newData[index][field] = value;
    
    // Jika NIK/NPSN berubah, reset validasi & buka kunci
    if (field === 'NIK' || field === 'NPSN') {
        newData[index].isValid = undefined; 
        newData[index].status_msg = "Data berubah, cek ulang";
        newData[index].sekolah_auto = "...";
        newData[index].isLocked = false; 
        setNeedsRevalidation(true); 
    }
    setParsedData(newData);
  };

  

  // 5. Sync Data (Nama, Jabatan, Golongan dari DB)
  const handleSyncData = (index) => {
    const newData = [...parsedData];
    const row = newData[index];
    
    console.log("Syncing row:", row);

    if (row.db_data) {
        // 1. Sync Nama
        row.Nama = row.db_data.nama;
        // 2. Sync Jabatan & Golongan
        row.Jabatan = row.db_data.jabatan; 
        row.Golongan = row.db_data.golongan;
        // 3. Sync Sekolah (via NPSN)
        row.NPSN = row.db_data.npsn;
        // row.sekolah_auto akan otomatis update saat NPSN berubah/divalidasi ulang, 
        // tapi kita bisa set manual kalau data DB sudah ada nama sekolahnya
        row.sekolah_auto = row.db_data.sekolah; 

        row.isLocked = true; // Kunci baris ini
        delete row.diff_flags; // Hapus flag perbedaan
        
        toast.success("Data peserta disinkronkan dengan Database.");
    }
    setParsedData(newData);
  };

  const handleDeleteRow = (index) => {
    const newData = parsedData.filter((_, i) => i !== index);
    setParsedData(newData);
    if (newData.length === 0) setValidationDone(false);
  };

  const handleSave = async () => {
    const validPeserta = parsedData.filter(p => p.isValid);
    if (validPeserta.length === 0) { toast.error("Tidak ada data valid"); return; }

    setIsUploading(true);
    try {
      const res = await fetch("/api/input-data/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_diklat: diklatId, peserta: validPeserta }),
      });
      if (res.ok) {
        toast.success(`Berhasil menyimpan ${validPeserta.length} peserta!`);
        setParsedData([]);
        setValidationDone(false);
        if (onSuccess) onSuccess();
      } else { toast.error("Gagal menyimpan data"); }
    } catch (error) { toast.error("Error Sistem"); } 
    finally { setIsUploading(false); }
  };

  const validCount = parsedData.filter(p => p.isValid).length;

  return (
    <div className="space-y-6">
      
      {/* AREA UPLOAD (DRAG & DROP) */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
             <h3 className="text-sm font-semibold text-slate-800">Upload Data Peserta</h3>
             <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="h-8">
                <Download className="mr-2 h-3.5 w-3.5" /> Download Template
            </Button>
        </div>

        <div 
            className={cn(
                "border-2 border-dashed rounded-xl p-8 transition-all duration-200 flex flex-col items-center justify-center gap-3",
                hasData 
                    ? "border-slate-200 bg-slate-50 cursor-not-allowed opacity-80" 
                    : "cursor-pointer border-slate-300 hover:border-blue-400 hover:bg-slate-50",
                isDragging && !hasData ? "border-blue-500 bg-blue-50/50 scale-[0.99]" : "",
                isValidating ? "opacity-50 pointer-events-none" : ""
            )}
            onDragOver={!hasData ? handleDragOver : undefined}
            onDragLeave={!hasData ? handleDragLeave : undefined}
            onDrop={!hasData ? handleDrop : undefined}
            onClick={() => !hasData && fileInputRef.current?.click()}
        >
            <input type="file" ref={fileInputRef} accept=".xlsx, .xls" className="hidden" onChange={handleFileChange} disabled={hasData} />
            
            <div className={cn("p-4 rounded-full transition-colors", hasData ? "bg-slate-200" : "bg-slate-100")}>
                {isValidating ? <Loader2 className="h-8 w-8 text-blue-600 animate-spin" /> : 
                 hasData ? <FileSpreadsheet className="h-8 w-8 text-slate-400" /> : 
                 <CloudUpload className="h-8 w-8 text-slate-400" />}
            </div>
            
            <div className="text-center space-y-1">
                <p className="text-sm font-medium text-slate-700">
                    {isValidating ? "Memvalidasi Data..." : hasData ? "File Berhasil Dimuat" : "Klik atau Drag file Excel ke sini"}
                </p>
                <p className="text-xs text-slate-500">{hasData ? "Reset tabel jika ingin ganti file." : "Format .xlsx (Max 5MB)"}</p>
            </div>
        </div>
      </div>

      {/* TABLE PREVIEW */}
      {(hasData) && (
        <>
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                 <div className="flex items-center gap-4 text-xs font-medium">
                    <span className="text-slate-600">Total: <b>{parsedData.length}</b> Baris</span>
                    {validationDone && (
                        <span className="text-green-600 flex items-center bg-white px-2 py-0.5 rounded border border-green-200 shadow-sm">
                            <CheckCircle className="w-3 h-3 mr-1"/> {validCount} Valid
                        </span>
                    )}
                 </div>
                 <Button variant="ghost" size="sm" className="h-6 text-xs text-slate-400 hover:text-red-500" onClick={() => setParsedData([])}>
                    <Trash2 className="w-3 h-3 mr-1" /> Reset Tabel
                 </Button>
            </div>

            <div className="bg-white border rounded-md max-h-[400px] overflow-auto relative shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                        <TableRow>
                            <TableHead className="w-[40px] text-center">#</TableHead>
                            <TableHead className="w-[80px]">Status</TableHead>
                            <TableHead className="w-[130px]">NIK</TableHead>
                            <TableHead className="w-[200px]">Identitas Peserta</TableHead>
                            <TableHead className="w-[140px]">Jabatan & Gol</TableHead>
                            <TableHead className="w-[180px]">Unit Kerja</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {parsedData.map((row, idx) => {
                            // LOGIC CEK PERBEDAAN (Untuk Highlight UI)
                            const db = row.db_data || {};
                            const isNamaBeda = db.nama && row.Nama !== db.nama;
                            const isJabatanBeda = (db.jabatan && row.Jabatan !== db.jabatan) || (db.golongan && row.Golongan !== db.golongan);
                            const isSekolahBeda = db.npsn && row.NPSN !== db.npsn;
                            const hasDiff = isNamaBeda || isJabatanBeda || isSekolahBeda;

                            return (
                                <TableRow key={idx} className={!row.isValid ? "bg-red-50/50" : ""}>
                                    <TableCell className="text-xs text-slate-500 text-center align-top pt-3">{idx + 1}</TableCell>
                                    
                                    {/* STATUS */}
                                    <TableCell className="align-top pt-3">
                                        {row.isValid ? 
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 whitespace-nowrap">Valid</Badge> 
                                            : <Badge variant="destructive" className="whitespace-nowrap">Invalid</Badge>
                                        }
                                    </TableCell>
                                    
                                    {/* NIK */}
                                    <TableCell className="align-top pt-3">
                                        <Input 
                                            value={row.NIK || ''} 
                                            onChange={(e) => handleCellChange(idx, 'NIK', e.target.value)} 
                                            className="h-9 text-xs font-mono"
                                            placeholder="NIK"
                                        />
                                    </TableCell>

                                    {/* NAMA + SYNC BUTTON */}
                                    <TableCell className="align-top pt-3">
                                        <div className="flex gap-2">
                                            <div className="flex-1 space-y-1">
                                                <Input 
                                                    value={row.Nama || ''} 
                                                    onChange={(e) => handleCellChange(idx, 'Nama', e.target.value)} 
                                                    disabled={row.isLocked}
                                                    // Highlight kuning jika nama beda dengan DB
                                                    className={cn("h-9 text-xs transition-colors", 
                                                        isNamaBeda && !row.isLocked ? "border-orange-300 bg-orange-50 text-orange-900" : "",
                                                        row.isLocked && "bg-slate-100 text-slate-500"
                                                    )} 
                                                    placeholder="Nama Lengkap"
                                                />
                                                {/* Pesan kecil jika beda */}
                                                {isNamaBeda && !row.isLocked && (
                                                    <div className="text-[10px] text-orange-600 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3"/> DB: {db.nama}
                                                    </div>
                                                )}
                                            </div>

                                            {/* TOMBOL SYNC MASTER (Muncul jika ada perbedaan data apapun) */}
                                            {hasDiff && !row.isLocked && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button 
                                                                variant="outline" 
                                                                size="icon" 
                                                                className="h-9 w-9 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 shrink-0" 
                                                                onClick={() => handleSyncData(idx)}
                                                            >
                                                                <RefreshCw className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-[200px] text-xs">
                                                            <p className="font-bold border-b pb-1 mb-1">Samakan dengan Database:</p>
                                                            <ul className="list-disc pl-3 space-y-0.5">
                                                                {isNamaBeda && <li>Nama: {db.nama}</li>}
                                                                {isJabatanBeda && <li>Jab/Gol: {db.jabatan} ({db.golongan})</li>}
                                                                {isSekolahBeda && <li>Sekolah: {db.sekolah}</li>}
                                                            </ul>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* JABATAN & GOL (Stacked) */}
                                    <TableCell className="align-top pt-3">
                                        <div className="flex flex-col gap-2">
                                            <Input 
                                                value={row.Jabatan || ''} 
                                                placeholder="Jabatan"
                                                onChange={(e) => handleCellChange(idx, 'Jabatan', e.target.value)} 
                                                className={cn("h-8 text-[10px]", 
                                                    isJabatanBeda && !row.isLocked && "border-orange-300 bg-orange-50"
                                                )}
                                            />
                                            <Input 
                                                value={row.Golongan || ''} 
                                                placeholder="Gol"
                                                onChange={(e) => handleCellChange(idx, 'Golongan', e.target.value)} 
                                                className={cn("h-8 text-[10px] w-20", 
                                                    isJabatanBeda && !row.isLocked && "border-orange-300 bg-orange-50"
                                                )}
                                            />
                                        </div>
                                    </TableCell>

                                    {/* NPSN & SEKOLAH (Stacked) */}
                                    <TableCell className="align-top pt-3">
                                        <div className="flex flex-col gap-2">
                                            <Input 
                                                value={row.NPSN || ''} 
                                                onChange={(e) => handleCellChange(idx, 'NPSN', e.target.value)} 
                                                className={cn("h-9 text-xs w-[120px]", 
                                                    isSekolahBeda && !row.isLocked && "border-orange-300 bg-orange-50"
                                                )}
                                                placeholder="NPSN"
                                            />
                                            <div className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 min-h-[30px] flex items-center">
                                                <span className="text-[10px] font-medium text-slate-600 truncate max-w-[160px]" title={row.sekolah_auto}>
                                                    {row.sekolah_auto || "-"}
                                                </span>
                                            </div>
                                            {/* Error Message Sekolah */}
                                            {row.status_msg && row.status_msg !== "Valid" && (
                                                <span className="text-[10px] text-red-500 italic leading-tight">
                                                    {row.status_msg}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell className="align-top pt-3 text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => handleDeleteRow(idx)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="flex justify-end pt-4 border-t mt-4 gap-3 sticky bottom-0 bg-white/90 backdrop-blur pb-2">
                {needsRevalidation && (
                    <Button variant="outline" onClick={() => validateData(parsedData)} disabled={isValidating} className="border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100">
                        {isValidating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4"/>} Validasi Ulang
                    </Button>
                )}
                <Button onClick={handleSave} disabled={isUploading || needsRevalidation || validCount === 0} className="bg-green-600 hover:bg-green-700 shadow-sm">
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>} 
                    Simpan {validCount} Data
                </Button>
            </div>
        </>
      )}
    </div>
  );
}