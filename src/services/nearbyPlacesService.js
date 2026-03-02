/**
 * Nearby Places Service
 * Uses the Overpass API (free, no key) to find nearby safe places
 * like police stations, hospitals, pharmacies, and transit stops.
 */

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Categories of safe places to search for
const PLACE_QUERIES = [
    { type: 'police', tag: 'amenity=police', icon: '🚓', label: 'Police Station', safetyBoost: 95 },
    { type: 'hospital', tag: 'amenity=hospital', icon: '🏥', label: 'Hospital', safetyBoost: 90 },
    { type: 'pharmacy', tag: 'amenity=pharmacy', icon: '💊', label: 'Pharmacy', safetyBoost: 70 },
    { type: 'bus_station', tag: 'amenity=bus_station', icon: '🚌', label: 'Bus Station', safetyBoost: 75 },
    { type: 'fire_station', tag: 'amenity=fire_station', icon: '🚒', label: 'Fire Station', safetyBoost: 88 },
];

/**
 * Build Overpass query to find nearby amenities within a radius
 * Uses nwr (node/way/relation) to catch buildings mapped as polygons
 */
function buildOverpassQuery(lat, lng, radiusMeters = 2000) {
    const amenities = PLACE_QUERIES.map(p => p.tag.split('=')[1]);
    const amenityFilter = amenities.map(a => `nwr["amenity"="${a}"](around:${radiusMeters},${lat},${lng});`).join('\n');
    return `
        [out:json][timeout:15];
        (
            ${amenityFilter}
        );
        out center 30;
    `;
}

/**
 * Calculate distance between two lat/lng points (Haversine formula)
 */
function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Estimate walking time from distance in meters
 */
function estimateWalkTime(distanceMeters) {
    const mins = Math.round(distanceMeters / 80); // ~80m/min walking speed
    if (mins < 1) return '< 1 min';
    return `${mins} min`;
}

/**
 * Calculate a safety score based on distance and place type
 */
function calcSafety(distanceMeters, safetyBoost) {
    // Closer = safer, base score from place type
    const distancePenalty = Math.min(distanceMeters / 50, 30);
    return Math.max(20, Math.round(safetyBoost - distancePenalty));
}

/**
 * Determine risk level from safety score
 */
function riskFromScore(score) {
    if (score >= 75) return 'low';
    if (score >= 50) return 'medium';
    return 'high';
}

/**
 * Fetch nearby safe places and build route suggestions
 * @param {number} lat 
 * @param {number} lng 
 * @param {string} cityName
 * @returns {Promise<{routes: Array, nearbyPlaces: Array}>}
 */
export async function fetchNearbySafePlaces(lat, lng, cityName = 'Your Area') {
    try {
        const query = buildOverpassQuery(lat, lng, 2500);
        const res = await fetch(OVERPASS_URL, {
            method: 'POST',
            body: `data=${encodeURIComponent(query)}`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        if (!res.ok) throw new Error(`Overpass API error: ${res.status}`);
        const data = await res.json();

        const places = (data.elements || [])
            .filter(el => el.tags?.name)
            .map(el => {
                const amenity = el.tags.amenity;
                const config = PLACE_QUERIES.find(p => p.tag.includes(amenity));
                if (!config) return null;

                // For node elements, lat/lon are direct; for way/relation, they're in .center
                const elLat = el.lat ?? el.center?.lat;
                const elLng = el.lon ?? el.center?.lon;
                if (!elLat || !elLng) return null;

                const distance = getDistance(lat, lng, elLat, elLng);
                const safety = calcSafety(distance, config.safetyBoost);

                return {
                    id: el.id,
                    name: el.tags.name,
                    type: config.type,
                    icon: config.icon,
                    label: config.label,
                    lat: elLat,
                    lng: elLng,
                    distance,
                    distanceText: distance < 1000
                        ? `${Math.round(distance)} m`
                        : `${(distance / 1000).toFixed(1)} km`,
                    walkTime: estimateWalkTime(distance),
                    safety,
                    risk: riskFromScore(safety),
                };
            })
            .filter(Boolean)
            .sort((a, b) => a.distance - b.distance);

        // Build route suggestions from top nearby safe places
        const routes = places.slice(0, 6).map((place, i) => ({
            id: place.id,
            name: `${place.icon} ${place.name}`,
            from: 'Your Location',
            to: place.name,
            distance: place.distanceText,
            duration: place.walkTime,
            safety: place.safety,
            risk: place.risk,
            features: getFeatures(place),
            description: `${place.label} — ${place.distanceText} away. Walk time: ~${place.walkTime}.`,
            lat: place.lat,
            lng: place.lng,
            placeType: place.type,
        }));

        // Nearby place markers for the map
        const nearbyMarkers = places.slice(0, 10).map(p => ({
            lat: p.lat,
            lng: p.lng,
            label: `${p.icon} ${p.name} (${p.distanceText})`,
            color: p.risk === 'low' ? '#27AE60' : p.risk === 'medium' ? '#F39C12' : '#E74C3C',
        }));

        return { routes, nearbyMarkers, places };
    } catch (err) {
        console.warn('Could not fetch nearby places:', err);
        return { routes: [], nearbyMarkers: [], places: [] };
    }
}

/**
 * Generate feature tags based on place type
 */
function getFeatures(place) {
    const base = [];
    switch (place.type) {
        case 'police':
            base.push('24/7 Available', 'Emergency Help', 'Official Authority');
            break;
        case 'hospital':
            base.push('Medical Aid', 'Emergency Room', '24/7 Available');
            break;
        case 'pharmacy':
            base.push('First Aid', 'Open Late', 'Safe Zone');
            break;
        case 'bus_station':
            base.push('Public Transport', 'CCTV Area', 'Crowd Safety');
            break;
        case 'fire_station':
            base.push('Emergency Services', '24/7 Available', 'Safe Zone');
            break;
        default:
            base.push('Safe Location');
    }
    if (place.distance < 500) base.push('Very Close');
    return base;
}
