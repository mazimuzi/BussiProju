"use client";

import { useState, useCallback } from "react";
import {
  digitransitQuery,
  ROUTE_PATTERN_QUERY,
  RoutePattern,
  RoutePatternResponse,
} from "@/lib/digitransit";

interface UseRoutePatternResult {
  pattern: RoutePattern | null;
  loading: boolean;
  error: string | null;
  fetchPattern: (patternId: string) => void;
  clear: () => void;
}

export function useRoutePattern(): UseRoutePatternResult {
  const [pattern, setPattern] = useState<RoutePattern | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPattern = useCallback(async (patternId: string) => {
    if (!patternId) {
      setPattern(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await digitransitQuery<RoutePatternResponse>(
        ROUTE_PATTERN_QUERY,
        { patternId }
      );

      setPattern(data.pattern || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tuntematon virhe");
      setPattern(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setPattern(null);
    setError(null);
  }, []);

  return { pattern, loading, error, fetchPattern, clear };
}