export const PTK_QUERY_TYPE = {
  PROFIL: "profil",
  RIWAYAT: "riwayat",
  RIWAYAT_DETAIL: "riwayat_detail",
  ALUMNI: "alumni",
};

export async function fetchPtkData(prisma, type, nik) {
  if (!nik) throw new Error("NIK required");

  switch (type) {
    case PTK_QUERY_TYPE.PROFIL: {
      const result = await prisma.data_ptk.findUnique({
        where: { nik: nik },
        include: {
          satuan_pendidikan: {
            include: {
              ref_wilayah: true,
            },
          },
        },
      });

      if (!result) return null;

      return {
        ...result,
        nama_sekolah: result.satuan_pendidikan?.nama || null,
        kecamatan: result.satuan_pendidikan?.ref_wilayah?.kecamatan?.trim() || null,
        kabupaten: result.satuan_pendidikan?.ref_wilayah?.kabupaten?.trim() || null,
        satuan_pendidikan: undefined, 
      };
    }

    case PTK_QUERY_TYPE.RIWAYAT: {
      const results = await prisma.data_alumni.findMany({
        where: { nik: nik },
        select: {
            status_kelulusan: true,
            nilai_akhir: true,
            master_diklat: {
                select: {
                    id: true,
                    title: true,
                    start_date: true,
                    category_id: true,
                }
            }
        },
        orderBy: {
          master_diklat: {
            start_date: 'desc'
          }
        }
      });

      return results.map(row => ({
          id: row.master_diklat?.id,
          nama: row.master_diklat?.title,
          tahun: row.master_diklat?.start_date 
            ? new Date(row.master_diklat.start_date).getFullYear().toString() 
            : null,
          angkatan_raw: row.master_diklat?.category_id,
          status: row.status_kelulusan,
          nilai_akhir: row.nilai_akhir
      }));
    }

    case PTK_QUERY_TYPE.RIWAYAT_DETAIL: {
      const results = await prisma.data_alumni.findMany({
        where: { nik: nik },
        include: {
            master_diklat: {
                include: {
                    ref_kategori: true,
                    ref_mode: true
                }
            }
        },
        orderBy: {
            master_diklat: { start_date: 'desc' }
        }
      });

      return results.map(row => ({
          id: row.master_diklat?.id,
          course_code: row.master_diklat?.course_code,
          judul_diklat: row.master_diklat?.title,
          start_date: row.master_diklat?.start_date,
          end_date: row.master_diklat?.end_date,
          total_jp: row.master_diklat?.total_jp,
          location: row.master_diklat?.location,
          status_kelulusan: row.status_kelulusan,
          no_sertifikat: row.no_sertifikat,
          nilai_akhir: row.nilai_akhir,
          category_name: row.master_diklat?.ref_kategori?.category_name,
          mode_name: row.master_diklat?.ref_mode?.mode_name
      }));
    }

    case PTK_QUERY_TYPE.ALUMNI: {
      return await prisma.data_alumni.findFirst({
        where: { nik: nik },
        orderBy: { created_at: 'desc' }
      });
    }

    default:
      throw new Error("Invalid Query Type");
  }
}