"use client";

import { useEffect, useState } from "react";

export function useDebounceSearch({
  endpoint,
  query,
  minLength = 3,
  delay = 500,
  extraParams = {},
}) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hasExtraParams = Object.values(extraParams).some(val => val !== "" && val !== null && val !== undefined);
    
    if ((!query || query.length < minLength) && !hasExtraParams) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          ...extraParams,
        });

        const response = await fetch(`${endpoint}?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (error) {
        console.error("Debounce search error:", error);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [query, endpoint, minLength, delay, JSON.stringify(extraParams)]);

  return { results, loading };
}