"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export function useAddressSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const search = useCallback(async (searchText: string) => {
    if (searchText.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchText }),
      });

      if (!response.ok) {
        throw new Error("Sökningen misslyckades");
      }

      const data = await response.json();
      if (data.Succeeded) {
        setResults(data.Buildings || []);
      } else {
        setResults([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sökningen misslyckades");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        search(value);
      }, 300);
    },
    [search]
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const clear = useCallback(() => {
    setQuery("");
    setResults([]);
    setError(null);
  }, []);

  return { query, results, loading, error, handleQueryChange, clear };
}
