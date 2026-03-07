'use client'

import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';

interface RoutePolylineProps {
    path: Array<{ lat: number; lng: number }>;
    strokeColor?: string;
    strokeWeight?: number;
    strokeOpacity?: number;
}

export function RoutePolyline({ 
    path, 
    strokeColor = '#007AC9',
    strokeWeight = 5,
    strokeOpacity = 0.8 
}: RoutePolylineProps) {
    const map = useMap();
    const mapsLibrary = useMapsLibrary('maps');
    const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

    useEffect(() => {
        if (!map || !mapsLibrary || !path.length) return;

        // Luo uusi polyline
        const newPolyline = new mapsLibrary.Polyline({
            path: path,
            strokeColor: strokeColor,
            strokeWeight: strokeWeight,
            strokeOpacity: strokeOpacity,
            map: map,
        });

        setPolyline(newPolyline);

        // Sovita kartta reitin mukaan
        const bounds = new google.maps.LatLngBounds();
        path.forEach(point => bounds.extend(point));
        map.fitBounds(bounds, 50); // 50px padding

        // Cleanup
        return () => {
            newPolyline.setMap(null);
        };
    }, [map, mapsLibrary, path, strokeColor, strokeWeight, strokeOpacity]);

    // Päivitä väri jos se muuttuu
    useEffect(() => {
        if (polyline) {
            polyline.setOptions({ strokeColor });
        }
    }, [polyline, strokeColor]);

    return null;
}