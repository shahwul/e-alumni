export function getActiveFilterCount(filters) {
  let count = 0;

  count += filters.kabupaten?.length || 0;
  count += filters.kecamatan?.length || 0;
  count += filters.judul_diklat?.length || 0;
  count += filters.sekolah?.length || 0;

  if (filters.jenjang) count += 1;
  if (filters.mapel) count += 1;
  if (filters.status) count += 1;
  if (filters.kategori) count += 1;
  if (filters.jenis) count += 1;
  if (filters.program) count += 1;
  if (filters.rumpun) count += 1;
  if (filters.sub_rumpun) count += 1;

  if (filters.dateRange?.from) count += 1;

  return count;
}
