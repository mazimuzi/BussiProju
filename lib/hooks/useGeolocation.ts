"use client";

import { useState, useEffect, useCallback } from "react";

interface Location {
  lat: number;
  lon: number;
}

interface UseGeolocationResult {
  location: Location | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Oletussijainti (Helsinki keskusta) jos GPS ei toimi
const DEFAULT_LOCATION: Location = {
  lat: 60.1699,
  lon: 24.9384,
};

export function useGeolocation(): UseGeolocationResult {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback(() => {
    // Tarkista tukeeko selain geolocationia
    if (!navigator.geolocation) {
      setError("Selaimesi ei tue paikannusta");
      setLocation(DEFAULT_LOCATION);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      // Onnistui
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLoading(false);
        setError(null);
      },
      // Epäonnistui
      (err) => {
        let errorMessage = "Paikannusvirhe";
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = "Paikannus evätty. Salli sijainti selaimen asetuksista.";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Sijaintitietoa ei saatavilla";
            break;
          case err.TIMEOUT:
            errorMessage = "Paikannuspyyntö aikakatkaistiin";
            break;
        }
        
        setError(errorMessage);
        setLocation(DEFAULT_LOCATION); // Käytä oletussijaintia virhetilanteessa
        setLoading(false);
      },
      // Asetukset
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Käytä välimuistissa olevaa sijaintia max 1 min
      }
    );
  }, []);

  // Hae sijainti kun komponentti mountataan
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return { location, loading, error, refetch: getLocation };
}