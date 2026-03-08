"use client";

import { useState, useEffect, useCallback } from "react";
import {
  digitransitQuery,
  STOP_TIMETABLE_QUERY,
  StopTimetableResponse,
  Departure,
} from "@/lib/digitransit";

interface UseStopTimetableOptions {
  stopId: string | null;
  numberOfDepartures?: number;
  refreshInterval?: number;
}

interface UseStopTimetableResult {
  stopName: string | null;
  departures: Departure[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStopTimetable({
  stopId,
  numberOfDepartures = 50,
  refreshInterval = 30000,
}: UseStopTimetableOptions): UseStopTimetableResult {
  const [stopName, setStopName] = useState<string | null>(null);
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimetable = useCallback(async () => {
    if (!stopId) {
      setDepartures([]);
      setStopName(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await digitransitQuery<StopTimetableResponse>(
        STOP_TIMETABLE_QUERY,
        { stopId, numberOfDepartures }
      );

      if (data.stop) {
        setStopName(data.stop.name);
        setDepartures(data.stop.stoptimesWithoutPatterns || []);
      } else {
        setError("Pysäkkiä ei löytynyt");
        setDepartures([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tuntematon virhe");
      setDepartures([]);
    } finally {
      setLoading(false);
    }
  }, [stopId, numberOfDepartures]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  useEffect(() => {
    if (!stopId || refreshInterval <= 0) return;

    const interval = setInterval(fetchTimetable, refreshInterval);
    return () => clearInterval(interval);
  }, [stopId, refreshInterval, fetchTimetable]);

  return { stopName, departures, loading, error, refetch: fetchTimetable };
}