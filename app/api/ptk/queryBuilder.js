<<<<<<< HEAD
// api/ptk/queryBuilder.js

export function buildPTKQueryParts(searchParams) {
  // ==========================================
  // 1. PARSE PARAMETER
  // ==========================================
  const params = {
    search: searchParams.get("search") || "",
    jenis_kelamin: searchParams.get("jenis_kelamin") || "",
    sekolah: searchParams.get("sekolah") || "",
    jenjang: searchParams.get("jenjang") || "",
    mapel: searchParams.get("mapel") || "",
=======
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
>>>>>>> 039b2f2c290143746972999032bb8270416ff878
    usiaMin: searchParams.get("usia_min"),
    usiaMax: searchParams.get("usia_max"),
    statusKepegawaian: searchParams.get("status_kepegawaian") || "",
    jenisPTK: searchParams.get("jenis_ptk") || "",
    jabatanPTK: searchParams.get("jabatan_ptk") || "",
    pendidikanTerakhir: searchParams.get("pendidikan_terakhir") || "",
    pendidikanBidang: searchParams.get("pendidikan_bidang") || "",
    pangkatGolongan: searchParams.get("pangkat_golongan") || "",
    kepalaSekolah: searchParams.get("kepala_sekolah"),
    status: searchParams.get("status") || "",
    kabupaten: searchParams.get("kabupaten")
      ? searchParams.get("kabupaten").split(",")
      : [],
    kecamatan: searchParams.get("kecamatan")
      ? searchParams.get("kecamatan").split(",")
      : [],
    rumpunId: searchParams.get("rumpun"),
    subRumpunId: searchParams.get("sub_rumpun"),
    kategoriId: searchParams.get("kategori_id"),
    kategoriParam: searchParams.get("kategori"),
    jenisParam: searchParams.get("jenis"),
    programParam: searchParams.get("program"),
    judulDiklatRaw: searchParams.get("judul_diklat"),
    modeFilter: searchParams.get("mode_filter") || "eligible",
    startDate: searchParams.get("start_date"),
    endDate: searchParams.get("end_date"),
<<<<<<< HEAD
    sortParam: searchParams.get("sort"),
    sortByLegacy: searchParams.get("sort_by") || "nama",
    sortOrderLegacy: searchParams.get("sort_order") || "asc",
=======
    npsnList: searchParams.get("sekolah")?.split(",") || [],
    sort: searchParams.get("sort"),
>>>>>>> 039b2f2c290143746972999032bb8270416ff878
  };

  const values = [];
  let counter = 1;
  let whereClause = ` WHERE 1=1 `;

  // ==========================================
  // 2. PRE-CALCULATE VARIABLES (Biar Rapi)
  // ==========================================

<<<<<<< HEAD
  // Parse Judul Diklat jadi Array
  const judulArray = params.judulDiklatRaw
    ? params.judulDiklatRaw.includes("||")
      ? params.judulDiklatRaw.split("||")
      : params.judulDiklatRaw.split(",")
    : [];

  // Cek apakah ada filter diklat aktif?
  const hasDiklatFilter =
    judulArray.length > 0 || params.kategoriParam || params.programParam;
=======
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
>>>>>>> 039b2f2c290143746972999032bb8270416ff878

  // GUARD CLAUSE: Mode History tapi TANPA filter diklat -> ABORT (Hemat Resource)
  if (!hasDiklatFilter && params.modeFilter === "history") {
    return {
      shouldAbort: true,
      whereClause,
      values,
      orderByClause: "",
      hasDiklatFilter,
      modeFilter: params.modeFilter,
    };
  }

  // ==========================================
  // 3. BUILD STANDARD WHERE (Filter PTK)
  // ==========================================
  if (params.search) {
    whereClause += ` AND (mv.nama_ptk ILIKE $${counter} OR mv.nik ILIKE $${counter})`;
    values.push(`%${params.search}%`);
    counter++;
  }
  if (params.jenis_kelamin) {
    whereClause += ` AND mv.jenis_kelamin = $${counter}`;
    values.push(params.jenis_kelamin);
    counter++;
  }
  if (params.sekolah) {
    whereClause += ` AND mv.nama_sekolah ILIKE $${counter}`;
    values.push(`%${params.sekolah}%`);
    counter++;
  }
  if (params.jenjang && params.jenjang !== "ALL") {
    whereClause += ` AND mv.bentuk_pendidikan = $${counter}`;
    values.push(params.jenjang);
    counter++;
  }
  if (params.mapel) {
    whereClause += ` AND mv.riwayat_sertifikasi ILIKE $${counter}`;
    values.push(`%${params.mapel}%`);
    counter++;
  }
  if (params.usiaMin && params.usiaMax) {
    whereClause += ` AND mv.usia_tahun >= $${counter} AND mv.usia_tahun <= $${counter + 1}`;
    values.push(params.usiaMin, params.usiaMax);
    counter += 2;
  }
  if (params.statusKepegawaian) {
    whereClause += ` AND mv.status_kepegawaian = $${counter}`;
    values.push(params.statusKepegawaian);
    counter++;
  }
  if (params.jenisPTK) {
    whereClause += ` AND mv.jenis_ptk = $${counter}`;
    values.push(params.jenisPTK);
    counter++;
  }
  if (params.jabatanPTK) {
    whereClause += ` AND mv.jabatan_ptk = $${counter}`;
    values.push(params.jabatanPTK);
    counter++;
  }
  if (params.pendidikanTerakhir) {
    whereClause += ` AND mv.riwayat_pend_jenjang = $${counter}`;
    values.push(params.pendidikanTerakhir);
    counter++;
  }
  if (params.pendidikanBidang) {
    whereClause += ` AND mv.riwayat_pend_bidang = $${counter}`;
    values.push(params.pendidikanBidang);
    counter++;
  }
  if (params.pangkatGolongan) {
    whereClause += ` AND mv.pangkat_golongan = $${counter}`;
    values.push(params.pangkatGolongan);
    counter++;
  }

  // Boolean Filters
  if (params.kepalaSekolah === "true")
    whereClause += ` AND mv.is_kepala_sekolah = TRUE`;
  else if (params.kepalaSekolah === "false")
    whereClause += ` AND mv.is_kepala_sekolah = FALSE`;

  if (params.status === "sudah")
    whereClause += ` AND mv.is_sudah_pelatihan = TRUE`;
  else if (params.status === "belum")
    whereClause += ` AND mv.is_sudah_pelatihan = FALSE`;

  // Array Filters (IN clause)
  if (params.kabupaten.length > 0) {
    const placeholders = params.kabupaten
      .map((_, i) => `$${counter + i}`)
      .join(",");
    whereClause += ` AND UPPER(mv.kabupaten) IN (${placeholders})`;
    params.kabupaten.forEach((k) => values.push(k.toUpperCase()));
    counter += params.kabupaten.length;
  }
  if (params.kecamatan.length > 0) {
    const placeholders = params.kecamatan
      .map((_, i) => `$${counter + i}`)
      .join(",");
    whereClause += ` AND UPPER(mv.kecamatan) IN (${placeholders})`;
    params.kecamatan.forEach((k) => values.push(k.toUpperCase()));
    counter += params.kecamatan.length;
  }

  // ID Filters
  if (params.rumpunId && params.rumpunId !== "ALL") {
    whereClause += ` AND mv.topic_id = $${counter}`;
    values.push(params.rumpunId);
    counter++;
  }
  if (params.subRumpunId && params.subRumpunId !== "ALL") {
    whereClause += ` AND mv.sub_topic_id = $${counter}`;
    values.push(params.subRumpunId);
    counter++;
  }
  if (params.kategoriId && params.kategoriId !== "ALL") {
    whereClause += ` AND mv.kategori_id = $${counter}`;
    values.push(params.kategoriId);
    counter++;
  }

  // ==========================================
  // 4. LOGIC TANGGAL & DIKLAT
  // ==========================================

  // Logic Tanggal di Main Query:
  // Hanya aktif jika user TIDAK sedang memfilter diklat spesifik.
  // (Jika sedang filter diklat, tanggal dipakai untuk filter kelulusan diklat di subquery)
  if (params.startDate && params.endDate && !hasDiklatFilter) {
    whereClause += ` AND mv.start_date >= $${counter} AND mv.end_date <= $${counter + 1}`;
    values.push(params.startDate, params.endDate);
    counter += 2;
  }

  // Logic Subquery Diklat (Complex Filter)
  if (hasDiklatFilter) {
<<<<<<< HEAD
    let subQueryConditions = "";

    // Filter Kategori & Program
    if (params.kategoriParam)
      subQueryConditions += ` AND md.jenis_kegiatan::text = '${params.kategoriParam}'`;
    if (params.programParam)
      subQueryConditions += ` AND md.jenis_program::text = '${params.programParam}'`;
=======
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
>>>>>>> 039b2f2c290143746972999032bb8270416ff878

    // Filter Judul
    if (judulArray.length > 0) {
      const placeholders = judulArray
        .map((_, i) => `$${counter + i}`)
        .join(",");
      subQueryConditions += ` AND md.title = ANY(ARRAY[${placeholders}])`;
      judulArray.forEach((t) => values.push(t.trim()));
      counter += judulArray.length;
    }

    // Filter Tanggal di Subquery (Hanya kelulusan dalam rentang ini)
    if (params.startDate && params.endDate) {
      subQueryConditions += ` AND md.start_date >= '${params.startDate}' AND md.end_date <= '${params.endDate}' `;
    }

    // Bangun Subquery Berdasarkan Mode
    if (params.modeFilter === "eligible") {
      // MODE ELIGIBLE: Cari yang BELUM Lulus (NOT IN)
      whereClause += ` 
            AND mv.nik NOT IN (
                SELECT da.nik FROM data_alumni da 
                JOIN master_diklat md ON da.id_diklat = md.id 
                WHERE da.status_kelulusan ILIKE 'Lulus' 
                ${subQueryConditions}
            )`;
    } else {
<<<<<<< HEAD
      // MODE HISTORY: Cari yang SUDAH Lulus (EXISTS)
      whereClause += ` 
            AND EXISTS (
                SELECT 1 FROM data_alumni da 
                JOIN master_diklat md ON da.id_diklat = md.id 
                WHERE da.nik::text = mv.nik::text 
                AND da.status_kelulusan ILIKE 'Lulus' 
                ${subQueryConditions}
            )`;
    }
  }

  // ==========================================
  // 5. BUILD ORDER BY
  // ==========================================
  let orderByClause = "";
  if (params.sortParam) {
    const sortParts = params.sortParam
      .split(",")
      .map((part) => {
        const [field, direction] = part.split(":");
        const dir = direction === "desc" ? "DESC" : "ASC";
        switch (field) {
          case "nama":
          case "nama_ptk":
            return `sub.nama_ptk ${dir}`;
          case "sekolah":
          case "nama_sekolah":
            return `sub.nama_sekolah ${dir}`;
          case "usia":
          case "usia_tahun":
            return `sub.usia_tahun ${dir}`;
          case "status":
            return `sub.status_kepegawaian ${dir}`;
          case "mapel":
            return `sub.mapel ${dir}`;
          case "is_sudah_pelatihan":
            return `sub.is_sudah_pelatihan ${dir}`;
          default:
            return null;
        }
      })
      .filter(Boolean);
    orderByClause =
      sortParts.length > 0
        ? `ORDER BY ${sortParts.join(", ")}`
        : `ORDER BY sub.nama_ptk ASC`;
  } else {
    // Legacy Fallback
    const dir = params.sortOrderLegacy === "desc" ? "DESC" : "ASC";
    switch (params.sortByLegacy) {
      case "nama":
        orderByClause = `ORDER BY sub.nama_ptk ${dir}`;
        break;
      case "sekolah":
        orderByClause = `ORDER BY sub.nama_sekolah ${dir}`;
        break;
      case "status":
        orderByClause = `ORDER BY sub.status_kepegawaian ${dir}`;
        break;
      case "usia":
        orderByClause = `ORDER BY sub.usia_tahun ${dir}`;
        break;
      default:
        orderByClause = `ORDER BY sub.nama_ptk ASC`;
    }
=======
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
      tanggal: "start_date"
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
>>>>>>> 039b2f2c290143746972999032bb8270416ff878
  }

  return {
    whereClause,
    values,
    orderByClause,
    shouldAbort: false,
    hasDiklatFilter,
    modeFilter: params.modeFilter,
    page: parseInt(searchParams.get("page")) || 1,
    limit: parseInt(searchParams.get("limit")) || 25,
  };
}
