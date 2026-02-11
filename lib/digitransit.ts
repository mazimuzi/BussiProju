// Digitransit GraphQL Client
// Käyttää Next.js API route:a CORS-ongelman välttämiseksi

const API_URL = "/api/digitransit";

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function digitransitQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const json: GraphQLResponse<T> = await response.json();

  if (json.errors) {
    throw new Error(json.errors.map(e => e.message).join(", "));
  }

  if (!json.data) {
    throw new Error("No data returned from API");
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

//Hae pysäkit nimellä
export const SEARCH_STOPS_QUERY = `
  query SearchStops($name: String!) {
    stops(name: $name) {
      gtfsId
      name
      lat
      lon
      vehicleMode
      zoneId
      parentStation {
        name
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
  zoneId?: string;
  parentStation?: {
    name: string;
  };
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

export interface SearchStopsResponse {
  stops: Stop[];
}

export interface Departure {
  scheduledArrival: number;
  realtimeArrival: number;
  arrivalDelay: number;
  realtime: boolean;
  serviceDay: number;
  trip: {
    route: {
      shortName: string;
      longName: string;
      mode: string;
    };
  };
  headsign: string;
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

export function formatTime(secondsFromMidnight: number, serviceDay: number): string {
  const date = new Date((serviceDay + secondsFromMidnight) * 1000);
  return date.toLocaleTimeString("fi-FI", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function minutesUntilDeparture(realtimeArrival: number, serviceDay: number): number {
  const departureTime = (serviceDay + realtimeArrival) * 1000;
  const now = Date.now();
  return Math.round((departureTime - now) / 60000);
}

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

//Pura kaupunki gtfsId:stä (esim. "LINKKI:123" -> "Jyväskylä")
export function getCityFromGtfsId(gtfsId: string): string {
  const prefix = gtfsId.split(":")[0];
  const cities: Record<string, string> = {
    "HSL": "Helsinki",
    "LINKKI": "Jyväskylä",
    "tampere": "Tampere",
    "OULU": "Oulu",
    "Kuopio": "Kuopio",
    "LAHTI": "Lahti",
    "Lappeenranta": "Lappeenranta",
    "Joensuu": "Joensuu",
    "Turku": "Turku",
    "Vaasa": "Vaasa",
    "Kotka": "Kotka",
    "Kouvola": "Kouvola",
    "Mikkeli": "Mikkeli",
    "Pori": "Pori",
    "Rovaniemi": "Rovaniemi",
    "Kajaani": "Kajaani",
    "WALTTI": "Waltti-alue",
    "digitraffic": "VR Junat",
    "matkahuolto": "Matkahuolto",
  };
  return cities[prefix] || prefix;
}
