import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { buildPrismaQuery } from '@/app/api/ptk/queryBuilder';
import ExcelJS from 'exceljs';

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const { 
        where, 
        orderBy, 
        hasDiklatFilter, 
        modeFilter 
    } = await buildPrismaQuery(searchParams, prisma);

    const isHistoryMode = modeFilter === 'history';

    if (!hasDiklatFilter && isHistoryMode) {
        return generateExcel([], isHistoryMode); 
    }

    const rows = await prisma.mv_dashboard_analitik.findMany({
        where: where,
        orderBy: orderBy,
        distinct: ['nik'], 
        select: {
            nama_ptk: true,
            nik: true,
            nuptk: true,
            nip: true,
            nama_sekolah: true,
            npsn_sekolah: true,
            bentuk_pendidikan: true,
            kecamatan: true,
            kabupaten: true,
            no_hp: true,
            jenis_ptk: true,
            jabatan_ptk: true,
            status_kepegawaian: true,
            pangkat_golongan: true,
            judul_diklat: true,
            total_jp: true,
            start_date: true,
            end_date: true,
            moda_diklat: true
        }
    });

    return await generateExcel(rows, isHistoryMode);

  } catch (error) {
    console.error("Error Export Excel:", error);
    return NextResponse.json({ error: 'Gagal export data' }, { status: 500 });
  }
}

async function generateExcel(rows, isHistoryMode) {
    const workbook = new ExcelJS.Workbook();
    const sheetName = isHistoryMode ? 'Riwayat Diklat' : 'Kandidat Peserta';
    const worksheet = workbook.addWorksheet(sheetName);

    const columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Nama Lengkap', key: 'nama_ptk', width: 30 },
        { header: 'NIK', key: 'nik', width: 20 },
        { header: 'NUPTK', key: 'nuptk', width: 20 },
        { header: 'Unit Kerja', key: 'nama_sekolah', width: 30 },
        { header: 'NPSN', key: 'npsn_sekolah', width: 12 },
        { header: 'Jenjang', key: 'jenjang', width: 10 },
        { header: 'Kecamatan', key: 'kecamatan', width: 15 },
        { header: 'Kabupaten', key: 'kabupaten', width: 15 },
        { header: 'Jabatan', key: 'jabatan_ptk', width: 20 },
        { header: 'Status', key: 'status_kepegawaian', width: 15 },
        { header: 'Golongan', key: 'pangkat_golongan', width: 10 },
        { header: 'No HP', key: 'no_hp', width: 15 },
    ];

    if (isHistoryMode) {
        columns.push(
            { header: 'Judul Diklat Terakhir', key: 'judul_diklat', width: 40 },
            { header: 'Total JP', key: 'total_jp', width: 10 },
            { header: 'Tgl Mulai', key: 'start_date', width: 15 },
            { header: 'Tgl Selesai', key: 'end_date', width: 15 },
            { header: 'Moda', key: 'moda_diklat', width: 15 }
        );
    }

    worksheet.columns = columns;

    rows.forEach((row, index) => {
        const rowData = {
            no: index + 1,
            nama_ptk: row.nama_ptk,
            nik: row.nik,
            nuptk: row.nuptk || '-',
            nama_sekolah: row.nama_sekolah,
            npsn_sekolah: row.npsn_sekolah,
            jenjang: row.bentuk_pendidikan, 
            kecamatan: row.kecamatan,
            kabupaten: row.kabupaten,
            jabatan_ptk: row.jabatan_ptk || '-',
            status_kepegawaian: row.status_kepegawaian,
            pangkat_golongan: row.pangkat_golongan || '-',
            no_hp: row.no_hp || '-',
        };

        if (isHistoryMode) {
            rowData.judul_diklat = row.judul_diklat || '-';
            rowData.total_jp = row.total_jp || '-';
            rowData.start_date = row.start_date ? new Date(row.start_date).toLocaleDateString('id-ID') : '-';
            rowData.end_date = row.end_date ? new Date(row.end_date).toLocaleDateString('id-ID') : '-';
            rowData.moda_diklat = row.moda_diklat || '-';
        }

        worksheet.addRow(rowData);
    });

    const headerRow = worksheet.getRow(1);
    const headerColor = isHistoryMode ? 'FF1F4E78' : 'FF2E7D32'; 
    
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }; 
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: headerColor } 
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: columns.length }
    };

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = isHistoryMode 
        ? `Riwayat_Diklat_${new Date().toISOString().slice(0,10)}.xlsx` 
        : `Kandidat_PTK_${new Date().toISOString().slice(0,10)}.xlsx`;

    return new NextResponse(buffer, {
        status: 200,
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${filename}"`,
        },
    });
}