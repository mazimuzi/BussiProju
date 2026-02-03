"use client";

import { useState } from "react";
import { MapProvider } from "./map-provider";
import { MapComponent } from "./map";
import { useNearbyStops } from "@/lib/hooks";
import { useStopTimetable } from "@/lib/hooks";
import { minutesUntilDeparture, NearbyStop } from "@/lib/digitransit";

// Helsinki keskusta oletussijainti - myöhemmin GPS
const DEFAULT_LOCATION = {
  lat: 60.1699,
  lon: 24.9384,
};

export default function Home() {
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [location] = useState(DEFAULT_LOCATION);

  // Hae lähimmät pysäkit Digitransit API:sta
  const {
    stops,
    loading: stopsLoading,
    error: stopsError,
  } = useNearbyStops({
    lat: location.lat,
    lon: location.lon,
    radius: 500,
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

  return (
    <div className="flex h-screen flex-col md:flex-row bg-background text-foreground">
      {/* SIDEBAR */}
      <aside className="md:w-80 w-full md:h-full h-72 border-r md:border-r md:border-b-0 border-b bg-white/80 backdrop-blur-sm shadow-sm p-4 flex flex-col">
        <header className="mb-4">
          <h1 className="text-xl font-semibold">Lähdöt läheltäsi</h1>
          <p className="text-sm text-gray-500">
            {selectedStopId && stopName
              ? `Pysäkki: ${stopName}`
              : "Valitse pysäkki nähdäksesi aikataulun"}
          </p>
        </header>

        {/* Takaisin-nappi kun pysäkki on valittu */}
        {selectedStopId ? (
          <button
            onClick={() => setSelectedStopId(null)}
            className="mb-4 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition"
          >
            ← Takaisin pysäkkilistaan
          </button>
        ) : (
          <button className="mb-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition">
            Hakunappi, myöhemmin toiminnallisuus
          </button>
        )}

        {/* SISÄLTÖ: Joko pysäkkilista tai aikataulu */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {/* Ladataan... */}
          {(stopsLoading || timetableLoading) && (
            <p className="text-sm text-gray-500">Ladataan...</p>
          )}

          {/* Virhe */}
          {stopsError && (
            <p className="text-sm text-red-500">Virhe: {stopsError}</p>
          )}

          {/* PYSÄKKILISTA (kun ei ole valittu pysäkkiä) */}
          {!selectedStopId && !stopsLoading && stops.map((nearbyStop: NearbyStop) => (
            <button
              key={nearbyStop.stop.gtfsId}
              onClick={() => setSelectedStopId(nearbyStop.stop.gtfsId)}
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

          {/* AIKATAULU (kun pysäkki on valittu) */}
          {selectedStopId && !timetableLoading && departures.map((departure, index) => {
            const minutes = minutesUntilDeparture(
              departure.realtimeArrival,
              departure.serviceDay
            );

            return (
              <div
                key={index}
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
              </div>
            );
          })}

          {/* Ei lähtöjä */}
          {selectedStopId && !timetableLoading && departures.length === 0 && (
            <p className="text-sm text-gray-500">Ei tulevia lähtöjä</p>
          )}

          {/* Ei pysäkkejä */}
          {!selectedStopId && !stopsLoading && stops.length === 0 && (
            <p className="text-sm text-gray-500">Ei pysäkkejä lähellä</p>
          )}
        </div>
      </aside>

      {/* KARTTA-ALUE */}
      <main className="flex-1 relative">
        <MapProvider>
          <MapComponent />
        </MapProvider>
      </main>
    </div>
  );
}