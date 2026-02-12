import useSWR from 'swr';

// Fetcher standar
const fetcher = (url) => fetch(url).then((res) => res.json());

// Hook Khusus Wilayah
export function useWilayah() {
  const { data, error, isLoading } = useSWR('/api/ref/wilayah', fetcher, {
    // OPTION PENTING:
    revalidateOnFocus: false, // Jangan fetch ulang pas klik tab browser
    dedupingInterval: 60000,  // (1 Menit) - Dalam 1 menit, request yang sama GA BAKAL dikirim lagi
  });

  return {
    wilayah: data || [],
    isLoading,
    isError: error
  };
}

// Hook Khusus Rumpun
export function useRumpun() {
  const { data, error, isLoading } = useSWR('/api/ref/rumpun', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  return {
    rumpun: data || [],
    isLoading,
    isError: error
  };
}

export function useSubRumpun(topicId) {
  const { data, error, isLoading } = useSWR(
    topicId ? `/api/ref/sub-rumpun?topic_id=${topicId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    subRumpun: data || [],
    isLoading,
    isError: error
  };
}

// Hook Khusus Kategori
export function useKategori() {
  const { data, error, isLoading } = useSWR('/api/ref/kategori', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  return {
    kategori: data || [],
    isLoading,
    isError: error
  };
}