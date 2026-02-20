import { format } from "date-fns";

export function buildPTKParams({
  page,
  limit,
  search,
  sorting,
  activeFilters,
  withPagination = true,
}) {
  const params = new URLSearchParams();

  if (withPagination && page && limit) {
    params.append("page", String(page));
    params.append("limit", String(limit));
  }

  if (search) params.append("search", search);

  if (activeFilters.kabupaten?.length)
    params.append("kabupaten", activeFilters.kabupaten.join(","));

  if (activeFilters.kecamatan?.length)
    params.append("kecamatan", activeFilters.kecamatan.join(","));

  if (activeFilters.sekolah?.length)
    params.append("sekolah", activeFilters.sekolah.join(","));

  if (activeFilters.judul_diklat?.length)
    params.append("judul_diklat", activeFilters.judul_diklat.join(","));

  if (activeFilters.jenis_kelamin) params.append("jenis_kelamin", activeFilters.jenis_kelamin);
  if (activeFilters.jenjang) params.append("jenjang", activeFilters.jenjang);
  if (activeFilters.mapel) params.append("mapel", activeFilters.mapel);
  
  if (activeFilters.status_kepegawaian) params.append("status_kepegawaian", activeFilters.status_kepegawaian);
  if (activeFilters.jenis_ptk) params.append("jenis_ptk", activeFilters.jenis_ptk);
  if (activeFilters.pendidikan_terakhir) params.append("pendidikan_terakhir", activeFilters.pendidikan_terakhir);
  if (activeFilters.pendidikan_bidang) params.append("pendidikan_bidang", activeFilters.pendidikan_bidang);
  if (activeFilters.pangkat_golongan) params.append("pangkat_golongan", activeFilters.pangkat_golongan);

  if (activeFilters.kepala_sekolah && activeFilters.kepala_sekolah !== "ALL") {
      params.append("kepala_sekolah", activeFilters.kepala_sekolah);
  }

  if (activeFilters.sekolah?.length) {
    params.append("sekolah", activeFilters.sekolah.join(",")); 
  }

  if (activeFilters.usia_min && activeFilters.usia_max) {
    params.append("usia_min", activeFilters.usia_min);
    params.append("usia_max", activeFilters.usia_max);
  }

  if (activeFilters.status) params.append("status", activeFilters.status);

  if (activeFilters.kategori) params.append("kategori", activeFilters.kategori);
  if (activeFilters.jenis) params.append("jenis", activeFilters.jenis);
  if (activeFilters.program) params.append("program", activeFilters.program);

  if (activeFilters.rumpun && activeFilters.rumpun !== "ALL")
    params.append("rumpun", activeFilters.rumpun);

  if (activeFilters.sub_rumpun && activeFilters.sub_rumpun !== "ALL")
    params.append("sub_rumpun", activeFilters.sub_rumpun);

  if (activeFilters.mode_filter)
    params.append("mode_filter", activeFilters.mode_filter);

  if (activeFilters.dateRange?.from) {
    const start = format(activeFilters.dateRange.from, "yyyy-MM-dd");
    const end = activeFilters.dateRange.to
      ? format(activeFilters.dateRange.to, "yyyy-MM-dd")
      : start;

    params.append("start_date", start);
    params.append("end_date", end);
  }

  if (sorting && sorting.length > 0) {
      const sortMapping = {
        "nama_ptk": "nama",
        "nama_sekolah": "sekolah",
        "usia_tahun": "usia",
        "status_kepegawaian": "status",
        "is_sudah_pelatihan": "is_sudah_pelatihan",
        "jumlah_diklat": "jumlah_diklat",
      };

      const sortString = sorting.map(s => {
        const key = sortMapping[s.id] || s.id;
        const dir = s.desc ? 'desc' : 'asc';
        return `${key}:${dir}`;
      }).join(',');

      params.set("sort", sortString); 
  }

  return params;
}