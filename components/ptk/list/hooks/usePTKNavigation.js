import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function usePTKNavigation(activeFilters) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateURL = (updates) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {

      if (key === "sorting") {
        params.delete("sort");
        if (Array.isArray(value) && value.length > 0) {
          const sortString = value
            .map(s => `${s.id}:${s.desc ? 'desc' : 'asc'}`)
            .join(',');
          params.set("sort", sortString);
        }
      }

      else if (["kabupaten", "kecamatan", "sekolah", "judul_diklat"].includes(key)) {
        params.delete(key);
        if (Array.isArray(value)) {
          value.forEach(v => { if (v) params.append(key, v); });
        }
      }

      else if (key === "dateRange") {
        params.delete("date_from");
        params.delete("date_to");
        if (value?.from) params.set("date_from", value.from.toISOString());
        if (value?.to) params.set("date_to", value.to.toISOString());
      }

      else {
        if (value !== undefined && value !== null && value !== "" && value !== "ALL") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
    });

    if (!updates.hasOwnProperty("page")) params.set("page", "1");

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  return {
    setPage: (newPage) => updateURL({ page: newPage }),
    setLimit: (newLimit) => updateURL({ limit: newLimit, page: 1 }),
    setSearch: (newSearch) => updateURL({ search: newSearch }),
    setSorting: (newSort) => updateURL({ sorting: newSort }),
    setActiveFilters: (newFilters) => {
      const resolved = typeof newFilters === 'function' ? newFilters(activeFilters) : newFilters;
      updateURL(resolved);
    }
  };
}