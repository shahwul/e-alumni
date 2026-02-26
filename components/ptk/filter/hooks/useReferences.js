import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

export function usePTKMetadata() {
  const { data, error, isLoading } = useSWR('/api/ref/ptk-metadata', fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 3600000,
  });

  return {
    jenisPtk: data?.jenisPtk || [],
    statusKepegawaian: data?.statusKepegawaian || [],
    mapel: data?.mapel || [],
    jurusan: data?.jurusan || [],

    isLoading,
    isError: error
  };
}

export function useWilayah() {
  const { data, error, isLoading } = useSWR('/api/ref/wilayah', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  return {
    wilayah: data || [],
    isLoading,
    isError: error
  };
}

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

export function useJenjang() {
  const { data, error, isLoading } = useSWR('/api/ref/jenjang', fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 3600000,
  });

  return {
    jenjang: data || [],
    isLoading,
    isError: error
  };
}

export function useBentukPendidikan() {
  const { data, error, isLoading } = useSWR('/api/ref/bentuk-pendidikan', fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 3600000,
  });

  return {
    bentukPendidikan: data || [],
    isLoading,
    isError: error
  };
}