'use client'

import { AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { useState } from 'react';

interface Location {
    id: string;
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
}

interface AdvancedMarkerComponentProps {
    location: Location;
    index: number;
}

export function AdvancedMarkerComponent({ location, index }: AdvancedMarkerComponentProps) {
    const [infoWindowOpen, setInfoWindowOpen] = useState(false);

    return (
        <AdvancedMarker
            position={{ lat: location.latitude, lng: location.longitude }}
            title={location.title || `Location ${index}`}
            onClick={() => setInfoWindowOpen(true)}
        >
            {infoWindowOpen && (
                <InfoWindow onCloseClick={() => setInfoWindowOpen(false)}>
                    <div className="p-2">
                        <h3 className="font-semibold">{location.title || `Location ${index}`}</h3>
                        {location.description && (
                            <p className="text-sm text-gray-600">{location.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Lat: {location.latitude.toFixed(4)}, Lng: {location.longitude.toFixed(4)}
                        </p>
                    </div>
                </InfoWindow>
            )}
        </AdvancedMarker>
    );
}
