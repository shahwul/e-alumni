import ExcelJS from 'exceljs';

export const downloadTemplatePeserta = async (diklatTitle) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Template Peserta');

  sheet.columns = [
    { header: 'NIK', key: 'nik', width: 20 },
    { header: 'Nama Lengkap', key: 'nama', width: 30 },
    { header: 'NPSN Sekolah', key: 'npsn', width: 15 },
    { header: 'Jabatan', key: 'jabatan', width: 20 },
    { header: 'Golongan', key: 'golongan', width: 10 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2E7D32' } // Hijau
  };

  sheet.addRow({ 
    nik: '1234567890123456', 
    nama: 'Contoh Nama Peserta', 
    npsn: '12345678', 
    jabatan: 'Guru Ahli Pertama', 
    golongan: 'III/a' 
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Template_Peserta_${diklatTitle.substring(0, 20)}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
};

export const parseExcelPeserta = async (file) => {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  
  const worksheet = workbook.getWorksheet(1);
  const jsonData = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const rowData = {
      NIK: row.getCell(1).text?.toString().trim(),
      Nama: row.getCell(2).text?.toString().trim(),
      NPSN: row.getCell(3).text?.toString().trim(),
      Jabatan: row.getCell(4).text?.toString().trim(),
      Golongan: row.getCell(5).text?.toString().trim(),

      isValid: true, 
      status_msg: 'Menunggu Validasi',
      sekolah_auto: 'Menunggu Sync...', 
      isLocked: false 
    };

    if (rowData.NIK || rowData.Nama) {
      jsonData.push(rowData);
    }
  });

  return jsonData;
};