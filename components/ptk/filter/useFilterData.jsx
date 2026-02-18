"use client";

import { 
  useWilayah, 
  useRumpun, 
  useKategori, 
  useSubRumpun 
} from "./hooks/useReferences"; // Sesuaikan path import

export function useFilterData(filters) {
  // 1. Ambil Wilayah (Auto Cache & Deduplication via SWR)
  const { wilayah, isLoading: loadingWilayah } = useWilayah();

  // 2. Ambil Rumpun
  const { rumpun, isLoading: loadingRumpun } = useRumpun();

  // 3. Ambil Kategori
  const { kategori, isLoading: loadingKategori } = useKategori();

  // 4. Ambil Sub Rumpun (Otomatis fetch kalau filters.rumpun ada isinya)
  // Logic "kapan harus fetch" sudah ada di dalam hook useSubRumpun
  const { subRumpun, isLoading: loadingSub } = useSubRumpun(filters.rumpun);

  // Return data bersih ke komponen UI
  return {
    wilayah,            // Array data wilayah
    rumpunOptions: rumpun,
    subRumpunOptions: subRumpun,
    kategoriOption: kategori,
    
    // Bonus: Kita bisa kasih tau UI kalau lagi loading
    loading: loadingWilayah || loadingRumpun || loadingKategori || loadingSub
  };
}