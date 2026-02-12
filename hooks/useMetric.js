import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const ALLOWED_METRICS = ["ptk", "alumni", "untrained"];

export function useMetric(defaultMetric = "ptk", syncWithUrl = false) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialMetric =
    syncWithUrl && ALLOWED_METRICS.includes(searchParams.get("metric"))
      ? searchParams.get("metric")
      : defaultMetric;

  const [metric, setMetricState] = useState(initialMetric);

  const setMetric = useCallback(
    (next) => {
      if (!ALLOWED_METRICS.includes(next)) return;

      setMetricState(next);

      if (syncWithUrl) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("metric", next);
        router.replace(`?${params.toString()}`);
      }
    },
    [searchParams, router, syncWithUrl]
  );

  return {
    metric,
    setMetric,
    allowedMetrics: ALLOWED_METRICS
  };
}
