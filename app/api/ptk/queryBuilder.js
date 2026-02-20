export async function buildPrismaQuery(searchParams, prisma) {
  const p = {
    search: searchParams.get("search"),
    kabupaten: searchParams.get("kabupaten")?.split(",") || [],
    kecamatan: searchParams.get("kecamatan")?.split(",") || [],
    jenjang: searchParams.get("jenjang"),
    statusKepegawaian: searchParams.get("status_kepegawaian"),
    jenisPTK: searchParams.get("jenis_ptk"),
    mapel: searchParams.get("mapel"),
    bidangPendidikan: searchParams.get("pendidikan_bidang"),
    pendidikanTerakhir: searchParams.get("pendidikan_terakhir"),
    jenisKelamin: searchParams.get("jenis_kelamin"),
    usiaMin: searchParams.get("usia_min"),
    usiaMax: searchParams.get("usia_max"),
    kepalaSekolah: searchParams.get("kepala_sekolah"),
    statusPelatihan: searchParams.get("status"),
    modeFilter: searchParams.get("mode_filter") || "eligible",
    kategoriParam: searchParams.get("kategori"),
    jenisParam: searchParams.get("jenis"),
    programParam: searchParams.get("program"),
    judulDiklat: searchParams.get("judul_diklat")?.split("||") || [],
    startDate: searchParams.get("start_date"),
    endDate: searchParams.get("end_date"),
    npsnList: searchParams.get("sekolah")?.split(",") || [],
    sort: searchParams.get("sort"),
  };

  const where = {
    AND: [],
  };

  const existingKandidat = await prisma.diklat_kandidat.findMany({
    select: { nik: true },
  });
  
  const kandidatNiks = existingKandidat.map(k => k.nik).filter(Boolean);

  if (kandidatNiks.length > 0) {
    where.AND.push({
      nik: { notIn: kandidatNiks },
    });
  }

  if (p.search) {
    where.AND.push({
      OR: [
        { nama_ptk: { contains: p.search, mode: "insensitive" } },
        { nik: { contains: p.search } },
        { nama_sekolah: { contains: p.search, mode: "insensitive" } },
      ],
    });
  }

  if (p.kabupaten.length > 0) {
    where.AND.push({
      kabupaten: { in: p.kabupaten, mode: "insensitive" },
    });
  }
  if (p.kecamatan.length > 0) {
    where.AND.push({
      kecamatan: { in: p.kecamatan, mode: "insensitive" },
    });
  }

  if (p.jenjang && p.jenjang !== "ALL") {
    where.AND.push({ bentuk_pendidikan: p.jenjang });
  }
  if (p.statusKepegawaian) {
    where.AND.push({ status_kepegawaian: p.statusKepegawaian });
  }
  if (p.jenisPTK) {
    where.AND.push({ jenis_ptk: p.jenisPTK });
  }

  if (p.mapel) {
    where.AND.push({
      riwayat_sertifikasi: { contains: p.mapel, mode: "insensitive" },
    });
  }

  if (p.bidangPendidikan) {
    where.AND.push({
      riwayat_pend_bidang: { contains: p.bidangPendidikan, mode: "insensitive" },
    });
  }

  if (p.pendidikanTerakhir) {
    where.AND.push({
      riwayat_pend_jenjang: { contains: p.pendidikanTerakhir, mode: "insensitive" },
    });
  }

  if (p.jenisKelamin) {
    where.AND.push({ jenis_kelamin: p.jenisKelamin });
  }

  if (p.usiaMin || p.usiaMax) {
    where.AND.push({
      usia_tahun: {
        gte: p.usiaMin ? parseInt(p.usiaMin) : undefined,
        lte: p.usiaMax ? parseInt(p.usiaMax) : undefined,
      },
    });
  }

  if (p.kepalaSekolah === "true") {
    where.AND.push({ is_kepala_sekolah: true });
  } else if (p.kepalaSekolah === "false") {
    where.AND.push({ is_kepala_sekolah: false });
  }

  if (p.statusPelatihan === "sudah") {
    where.AND.push({ is_sudah_pelatihan: true });
  } else if (p.statusPelatihan === "belum") {
    where.AND.push({ is_sudah_pelatihan: false });
  }

  if (p.npsnList.length > 0) {
    where.AND.push({
      npsn_sekolah: { in: p.npsnList }
    });
  }

const dateCriteria = p.startDate && p.endDate ? {
    gte: new Date(p.startDate),
    lte: new Date(p.endDate + "T23:59:59")
  } : undefined;

  const diklatIds = p.judulDiklat.map(id => parseInt(id)).filter(id => !isNaN(id));

  const hasDiklatFilter = !!(diklatIds.length > 0 || p.kategoriParam || p.jenisParam || p.programParam || dateCriteria);

  if (hasDiklatFilter) {
    if (p.modeFilter === "eligible") {
      const diklatCriteria = {
        master_diklat: {
          id: diklatIds.length > 0 ? { in: diklatIds } : undefined,
          category_id: p.kategoriParam ? { equals: parseInt(p.kategoriParam) } : undefined,
          jenis_kegiatan: p.jenisParam ? { equals: p.jenisParam } : undefined,
          jenis_program: p.programParam ? { equals: p.programParam } : undefined,
          start_date: dateCriteria,
        },
        status_kelulusan: "Lulus",
      };

      const excludedAlumni = await prisma.data_alumni.findMany({
        where: diklatCriteria,
        select: { nik: true },
        distinct: ["nik"],
      });
      
      const excludedNiks = excludedAlumni.map((a) => a.nik).filter(Boolean);

      if (excludedNiks.length > 0) {
        where.AND.push({
          nik: { notIn: excludedNiks },
        });
      }
    } else {
      if (dateCriteria) {
        where.AND.push({ start_date: dateCriteria });
      }
      
      if (diklatIds.length > 0) {
        where.AND.push({
          diklat_id: { in: diklatIds }
        });
      }

      if (p.kategoriParam) {
        where.AND.push({ category_id: parseInt(p.kategoriParam) });
      }
      if (p.jenisParam) {
        where.AND.push({ jenis_kegiatan: p.jenisParam });
      }
      if (p.programParam) {
        where.AND.push({ jenis_program: p.programParam });
      }
      where.AND.push({ status_kelulusan: 'Lulus' });
    }
  }

 let orderBy = [];

  if (p.sort) {
    const sortPairs = p.sort.split(",");

    const sortMap = {
      nama: "nama_ptk",
      sekolah: "nama_sekolah",
      usia: "usia_tahun",
      status: "status_kepegawaian",
      mapel: "riwayat_sertifikasi",
      tanggal: "start_date",
      jumlah_diklat: "jumlah_diklat",
    };

    sortPairs.forEach(pair => {
      const [field, direction] = pair.split(":");
      const dir = direction === "desc" ? "desc" : "asc";

      if (sortMap[field]) {
        orderBy.push({ [sortMap[field]]: dir });
      }
    });
  }

  if (orderBy.length === 0) {
    orderBy.push({ nama_ptk: "asc" });
  }
  orderBy.push({ nik: "asc" });

  return {
    where,
    orderBy,
    page: parseInt(searchParams.get("page") || 1),
    limit: parseInt(searchParams.get("limit") || 25),
    hasDiklatFilter,
    modeFilter: p.modeFilter,
  };
}