import { useState, useEffect } from "react";

import { fetchAnalytics } from "@/lib/analyticsClient";

export function useAnalytics({
  metric,
  kab,
  kec,
  year,
  diklat,
  groupBy,
  jenjang,
  caller,
  timeGrain,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    fetchAnalytics(
      { metric, kab, kec, year, diklat, groupBy, jenjang, caller, timeGrain },
      controller.signal
    )
      .then(result => {
        setData(result);
      })
      .catch(err => {
        if (err.name !== "AbortError") setError(err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [metric, kab, kec, year, diklat, groupBy, jenjang, caller, timeGrain]);

  return { data, loading, error };
}