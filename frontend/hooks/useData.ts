"use client";

import { useState, useEffect, useCallback } from "react";

interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * GET data hook for fetching from the Next.js API proxy.
 * Returns data, loading state, error message, and a refetch function.
 */
export function useData<T>(url: string): UseDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, { credentials: "include" });
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || "Request failed.");
      } else if (json.item !== undefined) {
        setData(json.item as T);
      } else if (json.items !== undefined) {
        setData({ items: json.items, total: json.total } as T);
      } else {
        setData(json as T);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
