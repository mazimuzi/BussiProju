'use client'

import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { AdvancedMarkerComponent } from './advanced-marker';
import { RoutePolyline } from './route-polyline';
import { useEffect } from 'react';
import { NearbyStop, RoutePattern, decodePolyline, getTransportModeEmoji } from '@/lib/digitransit';

interface MapComponentProps {
    stops?: NearbyStop[];
    userLocation?: { lat: number; lon: number } | null;
    onStopClick?: (stopId: string) => void;
    selectedStopId?: string | null;
    routePattern?: RoutePattern | null;
    highlightedRouteStopId?: string | null;
}

const defaultMapCenter = {
    lat: 60.1699,
    lng: 24.9384
}

const defaultMapZoom = 13;

// Tämä komponentti on Map:in sisällä, joten useMap() toimii
function MapContent({
    stops = [],
    userLocation,
    onStopClick,
    selectedStopId,
    routePattern,
    highlightedRouteStopId
}: MapComponentProps) {
    const map = useMap();

    // Zoomaa automaattisesti näyttämään koko reitti
    useEffect(() => {
        if (map && routePattern && routePattern.stops.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            
            routePattern.stops.forEach((stop) => {
                bounds.extend({ lat: stop.lat, lng: stop.lon });
            });
            
            setTimeout(() => {
                map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
            }, 100);
        }
    }, [map, routePattern]);

    const routePath = routePattern?.patternGeometry?.points 
        ? decodePolyline(routePattern.patternGeometry.points)
        : null;

    return (
        <>
            {/* Reitin viiva */}
            {routePath && (
                <RoutePolyline 
                    path={routePath} 
                    strokeColor={getRouteColor(routePattern?.route.mode)}
                />
            )}

            {/* Reitin pysäkit */}
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
                        isRouteStop: true,
                        isHighlighted: stop.gtfsId === highlightedRouteStopId
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
        </>
    );
}

// Pääkomponentti
const MapComponent = ({
    stops = [],
    userLocation,
    onStopClick,
    selectedStopId,
    routePattern,
    highlightedRouteStopId
}: MapComponentProps) => {

    const mapCenter = userLocation
        ? { lat: userLocation.lat, lng: userLocation.lon }
        : defaultMapCenter;

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}>
            <Map
                defaultCenter={mapCenter}
                center={routePattern ? undefined : mapCenter}
                defaultZoom={defaultMapZoom}
                className="w-full h-full"
                mapId="DEMO_MAP_ID"
                reuseMaps={true}
            >
                <MapContent
                    stops={stops}
                    userLocation={userLocation}
                    onStopClick={onStopClick}
                    selectedStopId={selectedStopId}
                    routePattern={routePattern}
                    highlightedRouteStopId={highlightedRouteStopId}
                />
            </Map>
        </APIProvider>
    )
};

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