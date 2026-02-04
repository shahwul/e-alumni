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

  // === Pagination (optional) ===
  if (withPagination && page && limit) {
    params.append("page", String(page));
    params.append("limit", String(limit));
  }

  // === Search ===
  if (search) params.append("search", search);

  // === ARRAY FILTERS ===
  if (activeFilters.kabupaten?.length)
    params.append("kabupaten", activeFilters.kabupaten.join(","));

  if (activeFilters.kecamatan?.length)
    params.append("kecamatan", activeFilters.kecamatan.join(","));

  if (activeFilters.sekolah?.length)
    params.append("sekolah", activeFilters.sekolah.join(","));

  if (activeFilters.judul_diklat?.length)
    params.append("judul_diklat", activeFilters.judul_diklat.join(","));

  // === STRING FILTERS ===
  if (activeFilters.jenjang) params.append("jenjang", activeFilters.jenjang);
  if (activeFilters.status) params.append("status", activeFilters.status);
  if (activeFilters.kategori) params.append("kategori", activeFilters.kategori);
  if (activeFilters.jenis) params.append("jenis", activeFilters.jenis);
  if (activeFilters.program) params.append("program", activeFilters.program);

  if (activeFilters.rumpun && activeFilters.rumpun !== "ALL")
    params.append("rumpun", activeFilters.rumpun);

  if (activeFilters.sub_rumpun && activeFilters.sub_rumpun !== "ALL")
    params.append("sub_rumpun", activeFilters.sub_rumpun);

  // === Mode Filter ===
  if (activeFilters.mode_filter)
    params.append("mode_filter", activeFilters.mode_filter);

  // === Date Range ===
  if (activeFilters.dateRange?.from) {
    const start = format(activeFilters.dateRange.from, "yyyy-MM-dd");
    const end = activeFilters.dateRange.to
      ? format(activeFilters.dateRange.to, "yyyy-MM-dd")
      : start;

    params.append("start_date", start);
    params.append("end_date", end);
  }

  // === Sorting ===
  if (sorting) {
    const [sortBy, sortOrder] = sorting.includes("_")
      ? sorting.split("_")
      : ["nama", "asc"];

    params.append("sort_by", sortBy);
    params.append("sort_order", sortOrder);
  }

  return params;
}
