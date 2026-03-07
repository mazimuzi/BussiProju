'use client'

import React from 'react';

interface PinProps {
    background?: string;
    scale?: number;
    borderColor?: string;
    glyph?: string | URL;
    glyphColor?: string;
    size?: number;
    isDot?: boolean;
}

export function Pin({ background = '#3366FF', scale = 1, borderColor = 'white', glyph, glyphColor = 'white', size = 40, isDot = false }: PinProps) {
    const isImage = typeof glyph === 'string' && (glyph.startsWith('http') || glyph.startsWith('/'));
    const glyphUrl = isImage && typeof glyph === 'string' ? glyph : glyph instanceof URL ? glyph.href : undefined;

    // Pieni piste reitin pysäkeille
    if (isDot) {
        const dotStyle: React.CSSProperties = {
            width: 12,
            height: 12,
            borderRadius: '50%',
            background,
            border: `2px solid ${borderColor}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            transform: `scale(${scale})`,
            transition: 'transform 150ms ease',
            cursor: 'pointer',
        };

        return <div style={dotStyle} aria-hidden />;
    }

    const wrapperStyle: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `translateY(-10%) scale(${scale})`,
        transition: 'transform 150ms ease',
        cursor: 'pointer',
    };

    const circleStyle: React.CSSProperties = {
        width: size,
        height: size,
        borderRadius: '50%',
        background,
        border: `3px solid ${borderColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
    };

    const tailStyle: React.CSSProperties = {
        width: 0,
        height: 0,
        borderLeft: `${size / 6}px solid transparent`,
        borderRight: `${size / 6}px solid transparent`,
        borderTop: `${size / 3}px solid ${background}`,
        transform: 'translateY(-6px)'
    };

    const glyphStyle: React.CSSProperties = {
        color: glyphColor,
        fontWeight: 700,
        fontSize: Math.max(12, Math.floor(size / 2.8)),
        lineHeight: 1,
        textAlign: 'center'
    };

    return (
        <div style={wrapperStyle} aria-hidden>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={circleStyle}>
                    {glyphUrl ? (
                        <img src={glyphUrl} alt="pin glyph" style={{ width: '60%', height: '60%', objectFit: 'contain', borderRadius: 4 }} />
                    ) : (
                        <span style={glyphStyle}>{typeof glyph === 'string' ? glyph : null}</span>
                    )}
                </div>
                <div style={tailStyle} />
            </div>
        </div>
    );
}
