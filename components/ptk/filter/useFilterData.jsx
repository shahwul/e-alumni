"use client";

import { 
  useWilayah, 
  useRumpun, 
  useKategori, 
  useSubRumpun,
  useJenjang 
} from "./hooks/useReferences"; 

export function useFilterData(filters) {
  const { wilayah, isLoading: loadingWilayah } = useWilayah();
  const { rumpun, isLoading: loadingRumpun } = useRumpun();
  const { kategori, isLoading: loadingKategori } = useKategori();
  const { jenjang, isLoading: loadingJenjang } = useJenjang(); 
  const { subRumpun, isLoading: loadingSub } = useSubRumpun(filters.rumpun);

  return {
    wilayah,           
    rumpunOptions: rumpun,
    subRumpunOptions: subRumpun,
    kategoriOption: kategori,
    jenjangOptions: jenjang, 

    loading: 
      loadingWilayah || 
      loadingRumpun || 
      loadingKategori || 
      loadingJenjang || 
      loadingSub
  };
}