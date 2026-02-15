import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import ExcelJS from 'exceljs';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: 'ID Diklat diperlukan' }, { status: 400 });
    }
    const rawData = await prisma.data_alumni.findMany({
        where: { 
            id_diklat: parseInt(id) 
        },
        distinct: ['nik'],
        orderBy: [
            { nik: 'asc' }, 
            { data_ptk: { nama_ptk: 'asc' } }
        ],
        select: {
            nik: true,
            nilai_akhir: true,
            status_kelulusan: true,
            master_diklat: {
                select: { title: true }
            },
            data_ptk: {
                select: {
                    nama_ptk: true,
                    satuan_pendidikan: {
                        select: {
                            nama: true,
                            ref_wilayah: {
                                select: { kabupaten: true }
                            }
                        }
                    }
                }
            }
        }
    });
    const judulDiklat = rawData.length > 0 ? rawData[0].master_diklat?.title : 'Diklat';

    const rows = rawData.map(item => ({
        nik: item.nik,
        nama_ptk: item.data_ptk?.nama_ptk || '-',
        nama_sekolah: item.data_ptk?.satuan_pendidikan?.nama || '-',
        kabupaten: item.data_ptk?.satuan_pendidikan?.ref_wilayah?.kabupaten || '-',
        nilai_akhir: item.nilai_akhir,
        status_kelulusan: item.status_kelulusan
    }));
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Peserta Diklat');

    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama Lengkap', key: 'nama_ptk', width: 30 },
      { header: 'NIK', key: 'nik', width: 20 },
      { header: 'Unit Kerja', key: 'nama_sekolah', width: 30 },
      { header: 'Kabupaten', key: 'kabupaten', width: 20 },
      { header: 'Nilai Akhir', key: 'nilai_akhir', width: 15 },
      { header: 'Status Kelulusan', key: 'status_kelulusan', width: 20 },
    ];

    rows.forEach((row, index) => {
      worksheet.addRow({
        no: index + 1,
        nama_ptk: row.nama_ptk,
        nik: row.nik,
        nama_sekolah: row.nama_sekolah,
        kabupaten: row.kabupaten,
        nilai_akhir: row.nilai_akhir || '-',
        status_kelulusan: row.status_kelulusan
      });
    });

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFED7D31' } 
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: 7 }
    };

    const buffer = await workbook.xlsx.writeBuffer();

    const safeTitle = (judulDiklat || 'Diklat')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 30);
        
    const filename = `Peserta_${safeTitle}_${new Date().toISOString().slice(0,10)}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error("Error Export Peserta:", error);
    return NextResponse.json({ error: 'Gagal export data' }, { status: 500 });
  }
}