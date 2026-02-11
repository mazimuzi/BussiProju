/* 
Since the map was loaded on client side, 
we need to make this component client rendered as well else error occurs
*/
'use client'

import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { AdvancedMarkerComponent } from './advanced-marker';
import { useState, useEffect } from 'react';
import { NearbyStop } from '@/lib/digitransit';

// Sample location data - replace with your actual data
interface MapComponentProps {
    stops?: NearbyStop[];
    userLocation?: { lat: number; lon: number } | null;
    onStopClick?: (stopId: string) => void;
    selectedStopId?: string | null;
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
    selectedStopId 
}: MapComponentProps) => {
    
    // Käytä käyttäjän sijaintia kartan keskipisteenä jos saatavilla
    const mapCenter = userLocation 
        ? { lat: userLocation.lat, lng: userLocation.lon }
        : defaultMapCenter;

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
                {/* Käyttäjän sijainti */}
                {userLocation && (
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
                {stops.map((nearbyStop, index) => {
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
                                isSelected: stop.gtfsId === selectedStopId
                            }}
                            onClick={() => onStopClick?.(stop.gtfsId)}
                        />
                    );
                })}
            </Map>
        </APIProvider>
    )
};

export { MapComponent };