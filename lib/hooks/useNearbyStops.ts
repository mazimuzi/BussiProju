"use client";

import { useState, useEffect, useCallback } from "react";
import {
  digitransitQuery,
  NEARBY_STOPS_QUERY,
  NearbyStop,
  NearbyStopsResponse,
} from "@/lib/digitransit";

interface UseNearbyStopsOptions {
  lat: number;
  lon: number;
  radius?: number; // metriä, oletus 500
  enabled?: boolean;
}

interface UseNearbyStopsResult {
  stops: NearbyStop[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useNearbyStops({
  lat,
  lon,
  radius = 500,
  enabled = true,
}: UseNearbyStopsOptions): UseNearbyStopsResult {
  const [stops, setStops] = useState<NearbyStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStops = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const data = await digitransitQuery<NearbyStopsResponse>(
        NEARBY_STOPS_QUERY,
        { lat, lon, radius }
      );

      const nearbyStops = data.stopsByRadius.edges.map((edge) => edge.node);
      setStops(nearbyStops);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tuntematon virhe");
      setStops([]);
    } finally {
      setLoading(false);
    }
  }, [lat, lon, radius, enabled]);

  useEffect(() => {
    fetchStops();
  }, [fetchStops]);

  return { stops, loading, error, refetch: fetchStops };
}