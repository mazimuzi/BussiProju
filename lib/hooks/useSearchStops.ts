"use client";

import { useState, useCallback } from "react";
import {
  digitransitQuery,
  SEARCH_STOPS_QUERY,
  Stop,
  SearchStopsResponse,
} from "@/lib/digitransit";

interface UseSearchStopsResult {
  results: Stop[];
  loading: boolean;
  error: string | null;
  search: (name: string) => void;
  clear: () => void;
}

export function useSearchStops(): UseSearchStopsResult {
  const [results, setResults] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (name: string) => {
    if (!name || name.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await digitransitQuery<SearchStopsResponse>(
        SEARCH_STOPS_QUERY,
        { name }
      );

      setResults(data.stops || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tuntematon virhe");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { results, loading, error, search, clear };
}