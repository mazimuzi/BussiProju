"use client";

import { useState } from "react";
import { MapProvider } from "./map-provider";
import { MapComponent } from "./map";
import { useNearbyStops } from "@/lib/hooks";
import { useStopTimetable } from "@/lib/hooks";
import { useGeolocation } from "@/lib/hooks";
import { useSearchStops } from "@/lib/hooks";
import { useRoutePattern } from "@/lib/hooks";
import { minutesUntilDeparture, getCityFromGtfsId, getModeInFinnish } from "@/lib/digitransit";
import type { Departure, NearbyStop, Stop } from "@/lib/digitransit";

export default function Home() {
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const[searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  // "Virtuaalinen" sijainti - joko GPS tai haetun pysäkin sijainti
  const [virtualLocation, setVirtualLocation] = useState<{ lat: number; lon: number } | null>(null);

  // Hae käyttäjän GPS-sijainti
  const {
    location: gpsLocation,
    loading: locationLoading,
    error: locationError,
    refetch: refetchLocation,
  } = useGeolocation();

  // Hakutoiminto
  const {
    results: searchResults,
    loading: searchLoading,
    error: searchError,
    search,
    clear: clearSearch,
  } = useSearchStops();

  // Reitin haku
const {
  pattern: routePattern,
  loading: routeLoading,
  fetchPattern,
  clear: clearRoute,
} = useRoutePattern();

  // Käytä virtuaalista sijaintia jos asetettu, muuten GPS
  const activeLocation = virtualLocation || gpsLocation;

  // Hae lähimmät pysäkit aktiivisen sijainnin perusteella
  const {
    stops,
    loading: stopsLoading,
    error: stopsError,
  } = useNearbyStops({
    lat: activeLocation?.lat ?? 0,
    lon: activeLocation?.lon ?? 0,
    radius: 500,
    enabled: !!activeLocation,
  });

  // Hae valitun pysäkin aikataulu
  const {
    stopName,
    departures,
    loading: timetableLoading,
  } = useStopTimetable({
    stopId: selectedStopId,
    numberOfDepartures: 5,
    refreshInterval: 30000,
  });

  const isLoading = locationLoading || stopsLoading;

  // Käsittele pysäkin klikkaus
  const handleStopClick = (stopId: string) => {
    setSelectedStopId(stopId);
    setIsSearchMode(false);
    clearSearch();
    setSearchQuery("");
  };

  // Käsittele hakutuloksen valinta - siirry pysäkin sijaintiin
  const handleSearchResultClick = (stop: Stop) => {
    setVirtualLocation({ lat: stop.lat, lon: stop.lon });
    setSelectedStopId(stop.gtfsId);
    setIsSearchMode(false);
    clearSearch();
    setSearchQuery("");
  };

  // Palaa omaan sijaintiin
  const handleReturnToMyLocation = () => {
    setVirtualLocation(null);
    setSelectedStopId(null);
    setIsSearchMode(false);
    clearSearch();
    setSearchQuery("");
  };

  // Näytä reitti kartalla
const handleShowRoute = (departure: Departure) => {
  const patternId = departure.trip.pattern.code;
  if (patternId) {
    fetchPattern(patternId);
  }
};

// Sulje reittinäkymä
const handleCloseRoute = () => {
  clearRoute();
};

  // Käsittele haku
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length >= 2) {
      search(searchQuery);
      setIsSearchMode(true);
    }
  };

  // Käsittele hakukentän muutos
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length >= 2) {
      search(e.target.value);
      setIsSearchMode(true);
    } else {
      clearSearch();
      setIsSearchMode(false);
    }
  };

  return (
    <div className="flex h-screen flex-col md:flex-row bg-background text-foreground">
      {/* SIDEBAR */}
      <aside className="md:w-80 w-full md:h-full h-72 border-r md:border-r md:border-b-0 border-b bg-white/80 backdrop-blur-sm shadow-sm p-4 flex flex-col">
        <header className="mb-4">
          <h1 className="text-xl font-semibold">Lähdöt läheltäsi</h1>
          <p className="text-sm text-gray-500">
            { routePattern
              ? routePattern.route.longName
              : selectedStopId && stopName
              ? `Pysäkki: ${stopName}`
              : virtualLocation
              ? "Haettu sijainti"
              : locationLoading
              ? "Haetaan sijaintia..."
              : "Hae pysäkkiä tai valitse listasta"}
          </p>
        </header>

        {/* HAKUKENTTÄ */}
        {!routePattern && (
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              placeholder="Hae pysäkkiä nimellä..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  clearSearch();
                  setIsSearchMode(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </form>
      )}
        {/* Sijaintivirhe */}
        {locationError && !virtualLocation && !routePattern && (
          <div className="mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-sm text-yellow-800">{locationError}</p>
          </div>
        )}

        {/* REITIN TIEDOT */}
        {routePattern && (
          <>
            <button
              type="button"
              onClick={handleCloseRoute}
              className="mb-4 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition"
            >
              ← Sulje reittinäkymä
            </button>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{getModeInFinnish(routePattern.route.mode)}</strong> • {routePattern.stops.length} pysäkkiä
              </p>
            </div>
          </>
        )}

        {/* Palaa omaan sijaintiin -nappi */}
        {virtualLocation && !routePattern && (
          <button
            type="button"
            onClick={handleReturnToMyLocation}
            className="mb-4 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
          >
            Palaa omaan sijaintiin
          </button>
        )}

        {/* Takaisin-nappi kun pysäkki on valittu */}
        {selectedStopId && !isSearchMode && !routePattern ? (
          <button
            type="button"
            onClick={() => setSelectedStopId(null)}
            className="mb-4 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition"
          >
            ← Takaisin pysäkkilistaan
          </button>
        ) : !isSearchMode && !virtualLocation && !routePattern && (
          <button
            type="button"
            onClick={refetchLocation}
            className="mb-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            Päivitä sijainti
          </button>
        )}

        {/* SISÄLTÖ */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {/* Ladataan... */}
          {(isLoading || searchLoading || routeLoading) && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-500">
                {routeLoading ? "Ladataan reittiä..." : searchLoading ? "Haetaan..." : locationLoading ? "Haetaan sijaintia..." : "Ladataan pysäkkejä..."}
              </span>
            </div>
          )}
 
          {/* Hakuvirhe */}
          {searchError && (
            <p className="text-sm text-red-500">Virhe: {searchError}</p>
          )}

          {/* REITIN PYSÄKKILISTA */}
          {routePattern && !routeLoading && (
            <>
              <p className="text-sm text-gray-500 font-medium">Reitin pysäkit:</p>
              {routePattern.stops.map((stop, index) => (
                <button
                  type="button"
                  key={stop.gtfsId}
                  onClick={() => handleStopClick(stop.gtfsId)}
                  className="w-full text-left rounded-xl border border-gray-200 bg-white p-3 shadow-sm hover:bg-orange-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {stop.name}
                    </span>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* HAKUTULOKSET */}
          {isSearchMode && !searchLoading && searchResults.length > 0 && (
            <>
              <p className="text-sm text-gray-500 font-medium">
                Hakutulokset ({searchResults.length})
              </p>
              {searchResults.slice(0, 20).map((stop: Stop) => (
                <button
                  type="button"
                  key={stop.gtfsId}
                  onClick={() => handleSearchResultClick(stop)}
                  className="w-full text-left rounded-xl border border-gray-200 bg-white p-3 shadow-sm hover:bg-blue-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">
                      {stop.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {getCityFromGtfsId(stop.gtfsId)} • {stop.vehicleMode || "BUS"}
                  </p>
                </button>
              ))}
            </>
          )}

          {/* Ei hakutuloksia */}
          {isSearchMode && !searchLoading && searchResults.length === 0 && searchQuery.length >= 2 && (
            <p className="text-sm text-gray-500">Ei hakutuloksia haulle "{searchQuery}"</p>
          )}

          {/* Virhe */}
          {stopsError && !isSearchMode && !routePattern && (
            <p className="text-sm text-red-500">Virhe: {stopsError}</p>
          )}

          {/* PYSÄKKILISTA */}
          {!selectedStopId && !isSearchMode && !isLoading && !routePattern && stops.map((nearbyStop: NearbyStop) => (
            <button
              type="button"
              key={nearbyStop.stop.gtfsId}
              onClick={() => handleStopClick(nearbyStop.stop.gtfsId)}
              className="w-full text-left rounded-xl border border-gray-200 bg-white p-3 shadow-sm hover:bg-gray-50 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-blue-600">
                  {nearbyStop.stop.name}
                </span>
                <span className="text-sm font-semibold text-gray-700">
                  {Math.round(nearbyStop.distance)} m
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {nearbyStop.stop.vehicleMode || "BUS"}
              </p>
            </button>
          ))}

          {/* AIKATAULU */}
          {selectedStopId && !isSearchMode && !routePattern && !timetableLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-500">Ladataan aikataulua...</span>
            </div>
          )}

          {selectedStopId && !isSearchMode && !routePattern && !timetableLoading && departures.map((departure) => {
            const minutes = minutesUntilDeparture(
              departure.realtimeArrival,
              departure.serviceDay
            );

            return (
              <div
                key={`${departure.serviceDay}-${departure.realtimeArrival}-${departure.trip.route.shortName}`}
                className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-600">
                    {departure.trip.route.shortName}
                  </span>
                  <span className={`text-sm font-semibold ${minutes <= 2 ? "text-red-600" : "text-gray-700"}`}>
                    {minutes <= 0 ? "Nyt!" : `${minutes} min`}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{departure.headsign}</p>
                {departure.realtime && (
                  <span className="text-xs text-green-600">● Reaaliaikainen</span>
                )}
                <button
                    type="button"
                    onClick={() => handleShowRoute(departure)}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Näytä reitti →
                  </button>
              </div>
            );
          })}

          {/* Ei lähtöjä */}
          {selectedStopId && !isSearchMode && !routePattern && !timetableLoading && departures.length === 0 && (
            <p className="text-sm text-gray-500">Ei tulevia lähtöjä</p>
          )}

          {/* Ei pysäkkejä */}
          {!selectedStopId && !isSearchMode && !isLoading && !routePattern && stops.length === 0 && (
            <p className="text-sm text-gray-500">Ei pysäkkejä lähellä (500m säteellä)</p>
          )}
        </div>
      </aside>

      {/* KARTTA-ALUE */}
      <main className="flex-1 relative">
        <MapProvider>
          <MapComponent 
            stops={stops}
            userLocation={activeLocation}
            onStopClick={handleStopClick}
            selectedStopId={selectedStopId}
            routePattern={routePattern}
          />
        </MapProvider>
      </main>
    </div>
  );
}