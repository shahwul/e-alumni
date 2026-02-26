import { useMemo } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

export function useHeatMapData({ selectedKab, selectedYear, selectedDiklat }) {
  const { data, loading } = useAnalytics({
    metric: "alumni",
    kab: selectedKab || undefined,
    year: selectedYear,
    diklat: selectedDiklat,
    groupBy: "Kecamatan",
    caller: "Mapper",
  });

  const valueMap = useMemo(() => {
    if (!data?.length) return {};
    const map = {};
    data.forEach((item) => {
      if (!item.name) return;
      const kecUpper = item.name.toUpperCase();
      const key = selectedKab ? `${selectedKab}|${kecUpper}` : kecUpper;
      map[key] = Number(item.value);
    });
    return map;
  }, [data, selectedKab]);

  const maxValue = useMemo(() => {
    if (!data?.length) return 0;
    return Math.max(...data.map((d) => Number(d.value)), 1);
  }, [data]);

  return { valueMap, maxValue, loading };
}
