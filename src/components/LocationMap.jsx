import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom user location icon
const userIcon = L.divIcon({
    className: 'safeher-marker',
    html: `<div style="
        width: 18px; height: 18px; border-radius: 50%;
        background: #9B59B6; border: 3px solid white;
        box-shadow: 0 0 0 4px rgba(155,89,182,0.3), 0 2px 8px rgba(0,0,0,0.2);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
});

// SOS active (pulsing red) icon
const sosIcon = L.divIcon({
    className: 'safeher-marker',
    html: `<div style="
        width: 20px; height: 20px; border-radius: 50%;
        background: #E74C3C; border: 3px solid white;
        box-shadow: 0 0 0 6px rgba(231,76,60,0.35), 0 0 20px rgba(231,76,60,0.4);
        animation: sosPulse 1.2s ease-in-out infinite;
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

// Pre-built colored marker icons — cached to avoid re-creation on every render
const markerIconCache = {};
function getMarkerIcon(color) {
    if (markerIconCache[color]) return markerIconCache[color];
    const icon = L.divIcon({
        className: 'safeher-marker',
        html: `<div style="
            width: 14px; height: 14px; border-radius: 50%;
            background: ${color}; border: 2.5px solid white;
            box-shadow: 0 0 8px ${color}80, 0 1px 4px rgba(0,0,0,0.2);
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
    });
    markerIconCache[color] = icon;
    return icon;
}

// Component to re-center map when location changes
function MapUpdater({ lat, lng }) {
    const map = useMap();
    const prevLatLng = useRef(null);
    useEffect(() => {
        const key = `${lat},${lng}`;
        if (prevLatLng.current !== key) {
            map.setView([lat, lng], map.getZoom(), { animate: true });
            prevLatLng.current = key;
        }
    }, [lat, lng, map]);
    return null;
}

// CSS injected once to fix Leaflet default icon styles
const MARKER_CSS = `
    @keyframes sosPulse {
        0%, 100% { box-shadow: 0 0 0 4px rgba(231,76,60,0.3), 0 0 15px rgba(231,76,60,0.3); }
        50% { box-shadow: 0 0 0 10px rgba(231,76,60,0.1), 0 0 30px rgba(231,76,60,0.5); }
    }
    .leaflet-container { width: 100%; height: 100%; border-radius: 1rem; }
    .safeher-marker {
        background: none !important;
        border: none !important;
        box-shadow: none !important;
    }
`;

/**
 * LocationMap — Leaflet map showing the user's current location
 */
export default function LocationMap({
    lat, lng, label = '', isActive = false,
    height = 280, zoom = 15, markers = [],
}) {
    // Memoize markers to prevent re-renders from destroying them
    const stableMarkers = useMemo(() =>
        markers.map(m => ({
            ...m,
            icon: getMarkerIcon(m.color || '#9B59B6'),
            key: `${m.lat}-${m.lng}`,
        })),
        [markers]
    );

    if (!lat || !lng) {
        return (
            <div className="rounded-2xl flex items-center justify-center" style={{
                height, background: 'rgba(155,89,182,0.04)',
                border: '1px solid rgba(155,89,182,0.15)',
            }}>
                <p className="text-sm font-montserrat" style={{ color: 'var(--text-muted)' }}>
                    📍 Acquiring location...
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl overflow-hidden" style={{
            height,
            border: isActive ? '2px solid rgba(231,76,60,0.4)' : '1px solid rgba(155,89,182,0.2)',
            boxShadow: isActive ? '0 0 20px rgba(231,76,60,0.15)' : '0 4px 20px rgba(155,89,182,0.06)',
        }}>
            <style>{MARKER_CSS}</style>
            <MapContainer
                center={[lat, lng]}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater lat={lat} lng={lng} />

                {/* User location marker */}
                <Marker position={[lat, lng]} icon={isActive ? sosIcon : userIcon}>
                    <Popup>
                        <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '12px' }}>
                            <strong>📍 {label || 'Your Location'}</strong>
                            <br />
                            {lat.toFixed(5)}, {lng.toFixed(5)}
                            {isActive && <><br /><span style={{ color: '#E74C3C', fontWeight: 'bold' }}>🚨 SOS Active</span></>}
                        </div>
                    </Popup>
                </Marker>

                {/* SOS active radius */}
                {isActive && (
                    <Circle center={[lat, lng]} radius={200}
                        pathOptions={{
                            color: '#E74C3C', fillColor: '#E74C3C',
                            fillOpacity: 0.08, weight: 1, dashArray: '6,4',
                        }}
                    />
                )}

                {/* Nearby places markers (hospitals, police, etc.) */}
                {stableMarkers.map(m => (
                    <Marker key={m.key} position={[m.lat, m.lng]} icon={m.icon}>
                        {m.label && (
                            <Popup>
                                <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '11px' }}>
                                    {m.label}
                                </span>
                            </Popup>
                        )}
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
