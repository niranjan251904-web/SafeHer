import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp, Shield, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { useSOS } from '../context/SOSContext';

const RISK_CONFIG = {
    low: { label: 'Safe', color: '#27AE60', bg: 'rgba(39,174,96,0.08)', border: 'rgba(39,174,96,0.2)', icon: CheckCircle },
    medium: { label: 'Moderate', color: '#F39C12', bg: 'rgba(243,156,18,0.08)', border: 'rgba(243,156,18,0.2)', icon: AlertTriangle },
    high: { label: 'High Risk', color: '#E74C3C', bg: 'rgba(231,76,60,0.08)', border: 'rgba(231,76,60,0.2)', icon: AlertTriangle },
};

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

/**
 * Fetch nearby neighbourhoods / landmarks and compute a risk score
 * based on presence of safety infrastructure (police, hospitals, lights, CCTV).
 */
async function fetchNearbyAreas(lat, lng) {
    // Search for named areas + safety infrastructure within 2 km
    // Use nwr (node/way/relation) for police & hospitals since most are mapped as buildings
    const query = `
        [out:json][timeout:15];
        (
            node["place"~"suburb|neighbourhood|quarter"](around:2000,${lat},${lng});
            nwr["amenity"="police"](around:2000,${lat},${lng});
            nwr["amenity"="hospital"](around:2000,${lat},${lng});
            node["highway"="street_lamp"](around:500,${lat},${lng});
        );
        out center 40;
    `;

    const res = await fetch(OVERPASS_URL, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (!res.ok) throw new Error('Overpass error');
    const data = await res.json();

    const elements = data.elements || [];

    // Count safety infrastructure
    const policeCount = elements.filter(e => e.tags?.amenity === 'police').length;
    const hospitalCount = elements.filter(e => e.tags?.amenity === 'hospital').length;
    const lampCount = elements.filter(e => e.tags?.highway === 'street_lamp').length;

    // Find named areas
    const areas = elements
        .filter(e => e.tags?.place && e.tags?.name)
        .map(e => e.tags.name);

    // Compute safety score for user's current location
    let score = 50; // baseline
    score += Math.min(policeCount * 12, 25);   // police nearby = safer
    score += Math.min(hospitalCount * 8, 15);   // hospitals nearby = safer
    score += Math.min(lampCount * 2, 10);       // street lights = safer
    score = Math.min(score, 98);

    const risk = score >= 75 ? 'low' : score >= 50 ? 'medium' : 'high';

    // Generate safety tips based on what's nearby
    const tips = [];
    if (policeCount > 0) tips.push(`${policeCount} police station${policeCount > 1 ? 's' : ''} within 2 km`);
    else tips.push('No police station nearby — stay alert');
    if (hospitalCount > 0) tips.push(`${hospitalCount} hospital${hospitalCount > 1 ? 's' : ''} within 2 km`);
    else tips.push('No hospital nearby — note emergency numbers');
    if (lampCount >= 5) tips.push('Well-lit area — good street lighting');
    else if (lampCount > 0) tips.push('Limited street lighting — use main roads');
    else tips.push('Low lighting data — stick to well-known paths');
    tips.push('Keep SafeHer SOS ready while travelling');

    return {
        score,
        risk,
        tips,
        areas: areas.slice(0, 5),
        infraCounts: { police: policeCount, hospital: hospitalCount, lamps: lampCount },
    };
}

export default function AreaRiskAnalyzer() {
    const { location } = useSOS();
    const [riskData, setRiskData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!location?.lat || !location?.lng) return;
        setLoading(true);
        setError('');
        fetchNearbyAreas(location.lat, location.lng)
            .then(data => { setRiskData(data); setLoading(false); })
            .catch(() => { setError('Could not analyze area'); setLoading(false); });
    }, [location?.lat, location?.lng]);

    if (loading) {
        return (
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-xl" style={{ background: 'rgba(155,89,182,0.08)' }}>
                        <TrendingUp size={20} style={{ color: '#9B59B6' }} />
                    </div>
                    <div>
                        <h3 className="font-montserrat font-bold text-base" style={{ color: '#1A1A2E' }}>Area Risk Analyzer</h3>
                        <p className="text-xs" style={{ color: '#6B6085' }}>Analyzing your current area...</p>
                    </div>
                </div>
                <div className="flex items-center justify-center py-8">
                    <Loader size={24} className="animate-spin" style={{ color: '#9B59B6' }} />
                </div>
            </div>
        );
    }

    if (error || !riskData) {
        return (
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                    <TrendingUp size={20} style={{ color: '#9B59B6' }} />
                    <h3 className="font-montserrat font-bold text-base" style={{ color: '#1A1A2E' }}>Area Risk Analyzer</h3>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{error || 'Location unavailable'}</p>
            </div>
        );
    }

    const cfg = RISK_CONFIG[riskData.risk];
    const Icon = cfg.icon;

    return (
        <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl" style={{ background: 'rgba(155,89,182,0.08)' }}>
                    <TrendingUp size={20} style={{ color: '#9B59B6' }} />
                </div>
                <div>
                    <h3 className="font-montserrat font-bold text-base" style={{ color: '#1A1A2E' }}>Area Risk Analyzer</h3>
                    <p className="text-xs" style={{ color: '#6B6085' }}>Live safety score for your location</p>
                </div>
            </div>

            {/* Nearby area tags */}
            {riskData.areas.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                    {riskData.areas.map((area, i) => (
                        <span key={i}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-montserrat font-medium"
                            style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                            <MapPin size={11} /> {area}
                        </span>
                    ))}
                </div>
            )}

            {/* Current Location Label */}
            <p className="text-xs font-montserrat font-semibold mb-2 flex items-center gap-1.5" style={{ color: '#6B6085' }}>
                <MapPin size={11} style={{ color: '#9B59B6' }} />
                📍 {location.city || 'Your Location'}
                <span className="ml-auto text-xs" style={{ color: '#9B59B6' }}>Live</span>
            </p>

            {/* Score Display */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl p-5 mb-4"
                style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
            >
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <Icon size={16} style={{ color: cfg.color }} />
                            <span className="font-montserrat font-bold text-lg" style={{ color: cfg.color }}>{cfg.label}</span>
                        </div>
                    </div>
                    {/* Score Ring */}
                    <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(155,89,182,0.08)" strokeWidth="3" />
                            <circle cx="18" cy="18" r="15.9" fill="none"
                                stroke={cfg.color} strokeWidth="3"
                                strokeDasharray={`${riskData.score} ${100 - riskData.score}`}
                                strokeLinecap="round"
                                className="progress-ring__circle"
                            />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center font-bold text-sm font-montserrat" style={{ color: cfg.color }}>
                            {riskData.score}
                        </span>
                    </div>
                </div>

                {/* Safety Tips */}
                <div className="space-y-1.5">
                    {riskData.tips.map((tip, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs" style={{ color: '#1A1A2E' }}>
                            <Shield size={11} style={{ color: cfg.color, flexShrink: 0 }} />
                            {tip}
                        </div>
                    ))}
                </div>

                {/* Infrastructure summary */}
                <div className="mt-3 pt-3 flex flex-wrap gap-3" style={{ borderTop: `1px solid ${cfg.border}` }}>
                    <span className="text-xs font-montserrat" style={{ color: '#6B6085' }}>
                        🚓 {riskData.infraCounts.police} police
                    </span>
                    <span className="text-xs font-montserrat" style={{ color: '#6B6085' }}>
                        🏥 {riskData.infraCounts.hospital} hospitals
                    </span>
                    <span className="text-xs font-montserrat" style={{ color: '#6B6085' }}>
                        💡 {riskData.infraCounts.lamps} lights
                    </span>
                </div>
            </motion.div>
        </div>
    );
}
