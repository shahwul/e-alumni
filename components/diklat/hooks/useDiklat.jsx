import { useState, useEffect } from "react";

export function useDiklat() {
  const [data, setData] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const [activeFilters, setActiveFilters] = useState({
    startDate: "", endDate: "", rumpun: "", sub_rumpun: "",
    moda: [], kategori: [], program: [], jenjang: [], jabatan: []
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        page: page.toString(),
        limit: limit.toString(),
      });

      Object.keys(activeFilters).forEach(key => {
        const val = activeFilters[key];
        if (Array.isArray(val) && val.length > 0) params.append(key, val.join(","));
        else if (val && !Array.isArray(val)) params.append(key, val);
      });

      const res = await fetch(`/api/diklat?${params.toString()}`);
      const result = await res.json();
      
      setData(result.data || []);
      setTotalData(result.meta?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchData, 500);
    return () => clearTimeout(timer);
  }, [search, activeFilters, page, limit]);

  return {
    data, totalData, loading, 
    search, setSearch, 
    page, setPage, 
    limit, setLimit,
    activeFilters, setActiveFilters
  };
}