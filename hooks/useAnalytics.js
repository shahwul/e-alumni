import { useState, useEffect } from "react";

import { fetchAnalytics } from "@/lib/analyticsClient";

export function useAnalytics(params) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    fetchAnalytics(params, controller.signal)
      .then(setData)
      .catch(err => {
        if (err.name !== "AbortError") setError(err);
      })
      .finally(() => setLoading(false));

      console.log("useAnalytics data:", data);

    return () => controller.abort();
  }, [JSON.stringify(params)]); 

  return { data, loading, error };
}