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
          gtfsId
          pattern {
            code
          }
          route {
            gtfsId
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

// Hae reitin geometria (polyline) ja pysäkit
export const ROUTE_PATTERN_QUERY = `
  query RoutePattern($patternId: String!) {
    pattern(id: $patternId) {
      code
      name
      directionId
      route {
        gtfsId
        shortName
        longName
        mode
      }
      patternGeometry {
        points
      }
      stops {
        gtfsId
        name
        lat
        lon
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
    gtfsId: string;
    pattern: {
      code: string;
    };
    route: {
      gtfsId: string;
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

export interface RoutePattern {
  code: string;
  name: string;
  directionId: number;
  route: {
    gtfsId: string;
    shortName: string;
    longName: string;
    mode: string;
  };
  patternGeometry: {
    points: string; // Encoded polyline
  };
  stops: Stop[];
}

export interface RoutePatternResponse {
  pattern: RoutePattern;
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

export function getTransportModeEmoji(mode?: string): string {
  if (!mode) return "📍";
  const emojis: Record<string, string> = {
    BUS: "🚌",
    TRAM: "🚊",
    RAIL: "🚂",
    SUBWAY: "🚇",
    METRO: "🚇",
    FERRY: "⛴️",
  };
  return emojis[mode.toUpperCase()] || "📍";
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

// Dekoodaa Google Encoded Polyline -> koordinaatit
export function decodePolyline(encoded: string): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      lat: lat / 1e5,
      lng: lng / 1e5,
    });
  }

  return points;
}
