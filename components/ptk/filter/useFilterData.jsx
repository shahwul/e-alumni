"use client";

import { 
  useWilayah, 
  useRumpun, 
  useKategori, 
  useSubRumpun 
} from "./hooks/useReferences"; 

export function useFilterData(filters) {
  const { wilayah, isLoading: loadingWilayah } = useWilayah();
  const { rumpun, isLoading: loadingRumpun } = useRumpun();
  const { kategori, isLoading: loadingKategori } = useKategori();
  const { subRumpun, isLoading: loadingSub } = useSubRumpun(filters.rumpun);

  return {
    wilayah,           
    rumpunOptions: rumpun,
    subRumpunOptions: subRumpun,
    kategoriOption: kategori,

    loading: loadingWilayah || loadingRumpun || loadingKategori || loadingSub
  };
}