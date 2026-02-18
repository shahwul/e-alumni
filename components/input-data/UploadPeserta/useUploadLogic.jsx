// components/UploadPeserta/useUploadLogic.js
import { useState, useRef } from "react";
import { toast } from "sonner";
import { parseExcelPeserta } from "../utils/excel-processor"; // Sesuaikan path

export function useUploadLogic(diklatId, onSuccess) {
  const [parsedData, setParsedData] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validationDone, setValidationDone] = useState(false);
  const [needsRevalidation, setNeedsRevalidation] = useState(false);

  // Logic Deteksi Duplikat
  const markDuplicates = (data) => {
    const nikMap = {};
    const newData = data.map((item) => ({ ...item }));

    newData.forEach((row, index) => {
      const nik = row.NIK ? String(row.NIK).trim() : "";
      if (nik) {
        if (!nikMap[nik]) nikMap[nik] = [];
        nikMap[nik].push(index);
      }
    });

    newData.forEach((row, index) => {
      const nik = row.NIK ? String(row.NIK).trim() : "";
      if (nik && nikMap[nik].length > 1) {
        row.isDuplicate = true;
        row.isValid = false;
        row.status_msg = `Duplikat dengan baris ${nikMap[nik].find((i) => i !== index) + 1}`;
        row.duplicateTarget = nikMap[nik].find((i) => i !== index);
      } else {
        if (row.isDuplicate) {
          row.isDuplicate = false;
          if (!row.status_msg || row.status_msg.includes("Duplikat")) {
            row.isValid = true;
            row.status_msg = "Menunggu Validasi";
          }
        }
      }
    });
    return newData;
  };

  const processFile = async (file) => {
    if (!file) return;
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      toast.error("Format file harus Excel (.xlsx / .xls)");
      return;
    }

    try {
      const rawData = await parseExcelPeserta(file);
      if (rawData.length === 0) {
        toast.error("File Excel kosong");
        return;
      }
      let processedData = rawData.map((d, i) => ({ ...d, _tempId: i }));
      processedData = markDuplicates(processedData);
      setParsedData(processedData);
      setValidationDone(false);
      validateData(processedData);
    } catch (err) {
      console.error(err);
      toast.error("Gagal membaca file Excel");
    }
  };

const validateData = async (dataToValidate) => {
    setIsValidating(true);
    try {
      const res = await fetch("/api/input-data/validate", {
        method: "POST",
        // TAMBAHKAN diklatId DI SINI
        body: JSON.stringify({ 
            peserta: dataToValidate,
            diklatId: diklatId 
        }),
      });
      
      if (!res.ok) throw new Error("Gagal validasi");
      const json = await res.json();
      
      if (json.data) {
        // Gabungkan logic duplikat Excel (lokal) dengan hasil validasi Server
        const finalData = markDuplicates(json.data);
        setParsedData(finalData);
        setValidationDone(true);
        setNeedsRevalidation(false);
        
        // Cek apakah ada yang statusnya "Sudah Terdaftar" untuk notifikasi
        const alreadyRegistered = json.data.filter(r => r.status_msg.includes("Sudah Terdaftar")).length;
        if (alreadyRegistered > 0) {
            toast.warning(`${alreadyRegistered} peserta sudah terdaftar di diklat ini.`);
        } else {
            toast.success("Validasi selesai.");
        }
      }
    } catch (err) {
      toast.error("Gagal validasi server.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleCellChange = (index, field, value) => {
    let newData = [...parsedData];
    newData[index][field] = value;

    if (field === "NIK") {
      newData = markDuplicates(newData);
      newData[index].isValid = false;
      newData[index].status_msg = "NIK berubah, cek validasi";
      newData[index].isLocked = false;
      setNeedsRevalidation(true);
    }
    if (field === "NPSN") {
      newData[index].isValid = false;
      newData[index].status_msg = "NPSN berubah, cek validasi";
      newData[index].isLocked = false;
      setNeedsRevalidation(true);
    }
    setParsedData(newData);
  };

  const handleSyncData = (index) => {
    const newData = [...parsedData];
    const row = newData[index];
    if (row.db_data) {
      row.Nama = row.db_data.nama;
      row.Jabatan = row.db_data.jabatan;
      row.Golongan = row.db_data.golongan;
      row.NPSN = row.db_data.npsn;
      row.sekolah_auto = row.db_data.sekolah;
      row.isLocked = true;
      if (!row.isDuplicate) {
        row.isValid = true;
        row.status_msg = "Terverifikasi (Sync DB)";
      }
      toast.success("Data disinkronkan.");
    }
    setParsedData(newData);
  };

  const handleDeleteRow = (index) => {
    const newData = parsedData.filter((_, i) => i !== index);
    const recheckedData = markDuplicates(newData);
    setParsedData(recheckedData);
  };

  const handleSave = async () => {
    const validPeserta = parsedData.filter((p) => p.isValid && !p.isDuplicate);
    if (validPeserta.length === 0) {
      toast.error("Tidak ada data valid");
      return;
    }
    setIsUploading(true);
    try {
      const res = await fetch(`/api/input-data/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_diklat: diklatId, peserta: validPeserta }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(`Berhasil menyimpan ${json.count || validPeserta.length} data!`);
        setParsedData([]);
        if (onSuccess) onSuccess();
      } else {
        toast.error(json.error || "Gagal menyimpan");
      }
    } catch (error) {
      toast.error("Error Sistem");
    } finally {
      setIsUploading(false);
    }
  };

  return {
    parsedData,
    setParsedData,
    isValidating,
    isUploading,
    validationDone,
    needsRevalidation,
    processFile,
    validateData,
    handleCellChange,
    handleSyncData,
    handleDeleteRow,
    handleSave,
  };
}