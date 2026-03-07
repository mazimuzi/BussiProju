/* 
Since the map was loaded on client side, 
we need to make this component client rendered as well else error occurs
*/
'use client'

import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { AdvancedMarkerComponent } from './advanced-marker';
import { RoutePolyline } from './route-polyline';
import { useState, useEffect } from 'react';
import { NearbyStop, RoutePattern, decodePolyline, getTransportModeEmoji } from '@/lib/digitransit';

// Sample location data - replace with your actual data
interface MapComponentProps {
    stops?: NearbyStop[];
    userLocation?: { lat: number; lon: number } | null;
    onStopClick?: (stopId: string) => void;
    selectedStopId?: string | null;
    routePattern?: RoutePattern | null;
}

const defaultMapCenter = {
    lat: 60.1699,
    lng: 24.9384
}

const defaultMapZoom = 13;



const MapComponent = ({
    stops = [],
    userLocation,
    onStopClick,
    selectedStopId,
    routePattern
}: MapComponentProps) => {

    // Käytä käyttäjän sijaintia kartan keskipisteenä jos saatavilla
    const mapCenter = userLocation
        ? { lat: userLocation.lat, lng: userLocation.lon }
        : defaultMapCenter;

    // Dekoodaa reitin polyline jos saatavilla
    const routePath = routePattern?.patternGeometry?.points 
        ? decodePolyline(routePattern.patternGeometry.points)
        : null;

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}>
            <Map
                defaultCenter={mapCenter}
                center={mapCenter}
                defaultZoom={defaultMapZoom}
                className="w-full h-screen"
                mapId="DEMO_MAP_ID"
                reuseMaps={true}
            >
                {/* Reitin viiva */}
                {routePath && (
                    <RoutePolyline 
                        path={routePath} 
                        strokeColor={getRouteColor(routePattern?.route.mode)}
                    />
                )}

                {/* Reitin pysäkit (jos reitti valittu) */}
                {routePattern?.stops.map((stop, index) => (
                    <AdvancedMarkerComponent
                        key={`route-stop-${stop.gtfsId}`}
                        index={index}
                        location={{
                            id: stop.gtfsId,
                            latitude: stop.lat,
                            longitude: stop.lon,
                            title: stop.name,
                            description: `Pysäkki ${index + 1}`,
                            isRouteStop: true
                        }}
                        onClick={() => onStopClick?.(stop.gtfsId)}
                    />
                ))}

                {/* Käyttäjän sijainti */}
                {userLocation && !routePattern && (
                    <AdvancedMarkerComponent
                        key="user-location"
                        index={-1}
                        location={{
                            id: 'user',
                            latitude: userLocation.lat,
                            longitude: userLocation.lon,
                            title: 'Sijaintisi',
                            description: 'Olet tässä',
                            isUserLocation: true
                        }}
                    />
                )}

                {/* Pysäkit */}
                {!routePattern && stops.map((nearbyStop, index) => {
                    const { stop } = nearbyStop;
                    if (!stop.lat || !stop.lon) return null;

                    return (
                        <AdvancedMarkerComponent
                            key={stop.gtfsId}
                            index={index}
                            location={{
                                id: stop.gtfsId,
                                latitude: stop.lat,
                                longitude: stop.lon,
                                title: stop.name,
                                description: `${Math.round(nearbyStop.distance)} m päässä`,
                                isSelected: stop.gtfsId === selectedStopId,
                                transportEmoji: getTransportModeEmoji(stop.vehicleMode)
                            }}
                            onClick={() => onStopClick?.(stop.gtfsId)}
                        />
                    );
                })}
            </Map>
        </APIProvider>
    )
};

// Väri kulkuvälineen mukaan
function getRouteColor(mode?: string): string {
    switch (mode) {
        case 'BUS': return '#007AC9';
        case 'TRAM': return '#00985F';
        case 'RAIL': return '#8C4799';
        case 'SUBWAY': return '#FF6319';
        case 'FERRY': return '#00B9E4';
        default: return '#007AC9';
    }
}

export { MapComponent };