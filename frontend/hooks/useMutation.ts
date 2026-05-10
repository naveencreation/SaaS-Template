"use client";

import { useState, useCallback } from "react";

interface UseMutationResult<T> {
  mutate: (body: unknown) => Promise<T | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Mutation hook for POST / PUT / DELETE / PATCH via the Next.js API proxy.
 * Returns a mutate function, loading state, and error message.
 */
export function useMutation<T>(
  url: string,
  method: "POST" | "PUT" | "DELETE" | "PATCH" = "POST"
): UseMutationResult<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (body: unknown): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: body ? JSON.stringify(body) : undefined,
        });
        const json = await res.json();
        if (!json.success) {
          setError(json.error?.message || "Request failed.");
          return null;
        }
        return json.item ?? json;
      } catch {
        setError("Network error. Please try again.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [url, method]
  );

  return { mutate, loading, error };
}
