"use client";
import { useEffect, useState } from "react";

export function useDebounceSearch({
  endpoint,
  query,
  minLength = 3,
  delay = 500,
}) {
  const [results, setResults] = useState([]);
  const [Loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < minLength) {
      setResults([]);
      setLoading(false);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`${endpoint}?q=${query}`);
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
  }, [query, endpoint, minLength, delay]);

  return { results, Loading };
}
