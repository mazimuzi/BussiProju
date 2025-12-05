/* 
Since the map was loaded on client side, 
we need to make this component client rendered as well else error occurs
*/
'use client'

import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { AdvancedMarkerComponent } from './advanced-marker';
import { useState, useEffect } from 'react';

// Sample location data - replace with your actual data
interface Location {
    id: string;
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
}

const defaultMapCenter = {
    lat: 60.1699,
    lng: 24.9384
}

const defaultMapZoom = 13;



const MapComponent = () => {
    const [myLocations, setMyLocations] = useState<Location[]>([]);

    // Load locations on component mount
    useEffect(() => {
        // TODO: Replace with your actual data source (API, context, props, etc.)
        setMyLocations([
            {
                id: '1',
                latitude: 60.1699,
                longitude: 24.9384,
                title: 'Pysäkki1',
                description: 'Bus stop at Pysäkki1'
            },
            {
                id: '2',
                latitude: 60.1760,
                longitude: 24.9496,
                title: 'Pysäkki2',
                description: 'Bus stop at Pysäkki2'
            },
            {
                id: '3',
                latitude: 60.1820,
                longitude: 24.9352,
                title: 'Pysäkki3',
                description: 'Bus stop at Pysäkki3'
            }
        ]);
    }, []);

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}>
            <Map
                defaultCenter={defaultMapCenter}
                defaultZoom={defaultMapZoom}
                className="w-full h-screen"
                mapId="DEMO_MAP_ID"
                reuseMaps={true}
            >
                {myLocations && myLocations.map((location, index) => {
                    let lat = location.latitude;
                    let lng = location.longitude;
                    if (!lat || !lng) return null;

                    return (
                        <AdvancedMarkerComponent
                            key={`${location.id}`}
                            index={index}
                            location={location}
                        />
                    );
                })}
            </Map>
        </APIProvider>
    )
};

export { MapComponent };