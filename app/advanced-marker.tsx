'use client'

import { AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { useState } from 'react';
import { Pin } from './pin';

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
    const [hovered, setHovered] = useState(false);

    return (
        <AdvancedMarker
            position={{ lat: location.latitude, lng: location.longitude }}
            title={location.title || `Location ${index}`}
            onClick={() => setInfoWindowOpen(true)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <Pin
                background="#3366FF"
                scale={hovered ? 1.15 : 1}
                borderColor="white"
                glyph={`${index + 1}`}
                glyphColor="white"
            />

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
