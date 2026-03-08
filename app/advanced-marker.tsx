'use client'

import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { useState } from 'react';
import { Pin } from './pin';

interface Location {
    id: string;
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
    isUserLocation?: boolean;
    isSelected?: boolean;
    isRouteStop?: boolean;
    isHighlighted?: boolean;
    vehicleMode?: string;
    transportEmoji?: string;
}

interface AdvancedMarkerComponentProps {
    location: Location;
    index: number;
    onClick?: () => void;
}

export function AdvancedMarkerComponent({ location, index, onClick }:
    AdvancedMarkerComponentProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    const [hovered, setHovered] = useState(false);

    // Värit
    let background = "#3366FF";
    if (location.isUserLocation) {
        background = "#34A853";
    } else if (location.isSelected) {
        background = "#EA4335";
    } else if (location.isHighlighted) {
        background = "#EA4335";
    } else if (location.isRouteStop) {
        background = "#FF9800";
    }

    const handleClick = () => {
        if (location.isRouteStop) {
            setShowTooltip(!showTooltip);
        }
        onClick?.();
    };

    // Suurenna jos highlighted, hovered tai tooltip näkyy
    const isEnlarged = location.isHighlighted || hovered || showTooltip;
    const scale = isEnlarged ? 1.5 : 1;

    // Näytä tooltip
    const showLabel = location.isHighlighted || showTooltip;

    return (
        <AdvancedMarker
            position={{ lat: location.latitude, lng: location.longitude }}
            title={location.title || `Location ${index}`}
            onClick={handleClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* TOOLTIP */}
                {showLabel && location.isRouteStop && (
                    <div style={{
                        position: 'absolute',
                        bottom: '100%',
                        marginBottom: '8px',
                        padding: '6px 10px',
                        background: '#1f2937',
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: 500,
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                        whiteSpace: 'nowrap',
                        zIndex: 50,
                    }}>
                        {location.title}
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: '6px solid #1f2937',
                        }} />
                    </div>
                )}

                {/* PIN */}
                <Pin
                    background={background}
                    scale={scale}
                    borderColor="white"
                    glyph={location.isUserLocation ? "📍" : location.isRouteStop ? "" : (location.transportEmoji || "📍")}
                    glyphColor="white"
                    isDot={location.isRouteStop && !isEnlarged}
                />
            </div>
        </AdvancedMarker>
    );
}