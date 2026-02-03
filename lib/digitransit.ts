// Digitransit GraphQL Client
// Dokumentaatio: https://digitransit.fi/en/developers/apis/1-routing-api/

const DIGITRANSIT_API_URL = "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql";

const API_KEY = process.env.NEXT_PUBLIC_DIGITRANSIT_API_KEY;
console.log("API KEY:", API_KEY); // LISÄÄ TÄMÄ

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function digitransitQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
 if (API_KEY) {
    headers["digitransit-subscription-key"] = API_KEY;
  }

  const response = await fetch(DIGITRANSIT_API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`Digitransit API error: ${response.status}`);
  }

  const json: GraphQLResponse<T> = await response.json();

  if (json.errors) {
    throw new Error(json.errors.map(e => e.message).join(", "));
  }

  if (!json.data) {
    throw new Error("No data returned from Digitransit API");
  }

  return json.data;
}

// ============================================
// GRAPHQL KYSELYT
// ============================================

// Hae pysäkit koordinaattien läheltä
export const NEARBY_STOPS_QUERY = `
  query NearbyStops($lat: Float!, $lon: Float!, $radius: Int!) {
    stopsByRadius(lat: $lat, lon: $lon, radius: $radius) {
      edges {
        node {
          stop {
            gtfsId
            name
            lat
            lon
            vehicleMode
          }
          distance
        }
      }
    }
  }
`;

// Hae pysäkin aikataulut
export const STOP_TIMETABLE_QUERY = `
  query StopTimetable($stopId: String!, $numberOfDepartures: Int!) {
    stop(id: $stopId) {
      gtfsId
      name
      lat
      lon
      stoptimesWithoutPatterns(numberOfDepartures: $numberOfDepartures) {
        scheduledArrival
        realtimeArrival
        arrivalDelay
        realtime
        serviceDay
        trip {
          route {
            shortName
            longName
            mode
          }
        }
        headsign
      }
    }
  }
`;

// ============================================
// TYYPIT
// ============================================

export interface Stop {
  gtfsId: string;
  name: string;
  lat: number;
  lon: number;
  vehicleMode?: string;
}

export interface NearbyStop {
  stop: Stop;
  distance: number;
}

export interface NearbyStopsResponse {
  stopsByRadius: {
    edges: Array<{
      node: NearbyStop;
    }>;
  };
}

export interface Departure {
  scheduledArrival: number; // sekunteja keskiyöstä
  realtimeArrival: number;
  arrivalDelay: number; // myöhästyminen sekunteina
  realtime: boolean; // onko reaaliaikainen tieto
  serviceDay: number; // päivämäärä Unix-aikana
  trip: {
    route: {
      shortName: string; // esim. "550"
      longName: string;  // esim. "Itäkeskus-Westendinasema"
      mode: string;      // BUS, TRAM, RAIL, etc.
    };
  };
  headsign: string; // määränpää
}

export interface StopTimetableResponse {
  stop: {
    gtfsId: string;
    name: string;
    lat: number;
    lon: number;
    stoptimesWithoutPatterns: Departure[];
  };
}

// ============================================
// APUFUNKTIOT
// ============================================

// Muunna sekunnit keskiyöstä -> "HH:MM" muotoon
export function formatTime(secondsFromMidnight: number, serviceDay: number): string {
  const date = new Date((serviceDay + secondsFromMidnight) * 1000);
  return date.toLocaleTimeString("fi-FI", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Laske kuinka monta minuuttia lähtöön
export function minutesUntilDeparture(realtimeArrival: number, serviceDay: number): number {
  const departureTime = (serviceDay + realtimeArrival) * 1000;
  const now = Date.now();
  return Math.round((departureTime - now) / 60000);
}

// Muunna mode suomeksi
export function getModeInFinnish(mode: string): string {
  const modes: Record<string, string> = {
    BUS: "Bussi",
    TRAM: "Raitiovaunu",
    RAIL: "Juna",
    SUBWAY: "Metro",
    FERRY: "Lautta",
  };
  return modes[mode] || mode;
}
