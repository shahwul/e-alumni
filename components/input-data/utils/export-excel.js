// utils/export-excel.js
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toast } from "sonner";

export const generateAndDownloadExcel = async (data, diklatTitle) => {
  if (!data || data.length === 0) {
    toast.error("Tidak ada data untuk diexport");
    return;
  }

  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Daftar Kandidat");

    const columnsConfig = [
        { header: "No", key: "no", width: 5 },
        { header: "Nama Lengkap", key: "nama", width: 30 },
        { header: "NIK", key: "nik", width: 20 },
        { header: "NIP", key: "nip", width: 20 },
        { header: "Jenis Kelamin", key: "jenis_kelamin", width: 15 },
        { header: "Tempat Lahir", key: "tempat_lahir", width: 20 },
        { header: "Tanggal Lahir", key: "tanggal_lahir", width: 15 },
        { header: "NPSN", key: "npsn", width: 15 },
        { header: "Unit Kerja", key: "nama_sekolah", width: 30 },
        { header: "Kecamatan", key: "kecamatan", width: 20 },
        { header: "Kabupaten", key: "kabupaten", width: 20 },
        { header: "Agama", key: "agama", width: 15 },
        { header: "No. HP", key: "hp", width: 15 },
        { header: "Kode Pos", key: "kode_pos", width: 10 },
        { header: "Email", key: "email", width: 25 },
        { header: "Status Pegawai", key: "status_kepegawaian", width: 20 },
        { header: "Golongan", key: "pangkat_golongan", width: 10 },
        { header: "Jenis PTK", key: "jenis_ptk", width: 20 },
        { header: "Jabatan (Gabungan)", key: "jabatan", width: 30 },
        { header: "Tugas Tambahan", key: "tugas_tambahan", width: 20 },
        { header: "SK CPNS", key: "sk_cpns", width: 20 },
        { header: "TMT CPNS", key: "tmt_cpns", width: 15 },
        { header: "SK Pengangkatan", key: "sk_pengangkatan", width: 20 },
        { header: "TMT Pengangkatan", key: "tmt_pengangkatan", width: 15 },
        { header: "TMT Tugas", key: "tmt_tugas", width: 15 },
        { header: "Masa Kerja (Thn)", key: "masa_kerja_tahun", width: 10 },
        { header: "Pendidikan", key: "riwayat_pend_jenjang", width: 10 },
        { header: "Bidang Studi", key: "riwayat_pend_bidang", width: 20 },
        { header: "Sertifikasi", key: "riwayat_sertifikasi", width: 30 },
    ];

    sheet.columns = columnsConfig.map(col => ({ key: col.key, width: col.width }));

    sheet.mergeCells(1, 1, 1, columnsConfig.length);
    const titleCell = sheet.getCell('A1');
    titleCell.value = `DAFTAR USULAN PESERTA: ${diklatTitle}`;
    titleCell.font = { size: 14, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    const headerRow = sheet.getRow(3);
    headerRow.values = columnsConfig.map(col => col.header);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    
    headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    data.forEach((row, index) => {
        const addedRow = sheet.addRow({
            no: index + 1,
            nama: row.nama_ptk,
            nik: row.nik || "-",
            nip: row.nip || "-",
            jenis_kelamin: row.jenis_kelamin || "-",
            tempat_lahir: row.tempat_lahir || "-",
            tanggal_lahir: row.tanggal_lahir || "-",
            npsn: row.npsn || "-",
            nama_sekolah: row.nama_sekolah || "-",
            kecamatan: row.kecamatan || "-",
            kabupaten: row.kabupaten || "-",
            agama: row.agama || "-",
            hp: row.no_hp || "-",
            kode_pos: row.kode_pos || "-",
            email: row.email || "-",
            status_kepegawaian: row.status_kepegawaian || "-",
            pangkat_golongan: row.pangkat_golongan || "-",
            jenis_ptk: row.jenis_ptk || "-",
            jabatan: `${row.jabatan_ptk || ''} ${row.pangkat_golongan ? `(${row.pangkat_golongan})` : ''}`,
            tugas_tambahan: row.tugas_tambahan || "-",
            sk_cpns: row.sk_cpns || "-",
            tmt_cpns: row.tmt_cpns || "-",
            sk_pengangkatan: row.sk_pengangkatan || "-",
            tmt_pengangkatan: row.tmt_pengangkatan || "-",
            tmt_tugas: row.tmt_tugas || "-",
            masa_kerja_tahun: row.masa_kerja_tahun || "-",
            riwayat_pend_jenjang: row.riwayat_pend_jenjang || "-",
            riwayat_pend_bidang: row.riwayat_pend_bidang || "-",
            riwayat_sertifikasi: row.riwayat_sertifikasi || "-",
        });

        addedRow.eachCell((cell) => {
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });
    });

    sheet.autoFilter = {
        from: { row: 3, column: 1 },
        to: { row: 3, column: columnsConfig.length }
    };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `Kandidat_${diklatTitle.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}.xlsx`);
    
    toast.success("File Excel berhasil diunduh");
  } catch (error) {
    console.error("Gagal export excel:", error);
    toast.error("Gagal mengunduh file Excel");
  }
};