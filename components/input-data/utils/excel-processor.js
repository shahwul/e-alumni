// utils/excel-processor.js
import * as XLSX from "xlsx";

/**
 * Membuat dan mendownload template Excel untuk peserta
 * @param {string} diklatTitle - Judul diklat untuk nama file
 */
export const downloadTemplatePeserta = (diklatTitle) => {
  // 1. Setup Data Dummy
  const header = [
    { "NIK": "1234567890123456", "Nama": "Nama Lengkap", "NPSN": "12345678", "Jabatan": "Guru Kelas", "Golongan": "III/a" }
  ];

  // 2. Buat Sheet
  const ws = XLSX.utils.json_to_sheet(header);
  
  // 3. Formatting: Paksa Format Text (@) agar NIK tidak berubah jadi eksponen
  const range = XLSX.utils.decode_range(ws['!ref']); 

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellRef]) continue;

      ws[cellRef].t = 's'; // Tipe String
      ws[cellRef].z = '@'; // Format Text
    }
  }
  
  // 4. Atur Lebar Kolom
  ws['!cols'] = [
    { wch: 25 }, // NIK
    { wch: 30 }, // Nama
    { wch: 15 }, // NPSN
    { wch: 20 }, // Jabatan
    { wch: 10 }, // Golongan
  ];

  // 5. Generate Nama File yang Aman
  // Hapus karakter aneh agar tidak error saat save file
  const safeTitle = (diklatTitle || "Diklat").replace(/[^a-z0-9]/gi, '_').substring(0, 50);
  const fileName = `Template_Peserta_${safeTitle}.xlsx`;

  // 6. Download
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, fileName);
};

/**
 * Membaca file Excel yang diupload dan mengembalikannya sebagai JSON
 * @param {File} file - File object dari input
 * @returns {Promise<Array>} - Array of Objects
 */
export const parseExcelPeserta = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (evt) => {
      try {
        const arrayBuffer = evt.target.result;
        const wb = XLSX.read(arrayBuffer, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(ws);
        resolve(rawData);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};