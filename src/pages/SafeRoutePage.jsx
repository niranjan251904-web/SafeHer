import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, AlertTriangle, CheckCircle, Clock, Shield, ChevronRight, Loader } from 'lucide-react';
import { safetyTips } from '../data/safeRoutes';
import AreaRiskAnalyzer from '../components/AreaRiskAnalyzer';
import LocationMap from '../components/LocationMap';
import { useSOS } from '../context/SOSContext';

const RISK_CONFIG = {
    low: { label: 'Safe Route', color: '#27AE60', bg: 'rgba(39,174,96,0.1)', border: 'rgba(39,174,96,0.25)', icon: CheckCircle },
    medium: { label: 'Use Caution', color: '#F39C12', bg: 'rgba(243,156,18,0.1)', border: 'rgba(243,156,18,0.25)', icon: AlertTriangle },
    high: { label: 'High Risk', color: '#E74C3C', bg: 'rgba(231,76,60,0.1)', border: 'rgba(231,76,60,0.25)', icon: AlertTriangle },
};

export default function SafeRoutePage() {
    const { location, nearbyPlaces, placesLoading } = useSOS();
    const [selectedRoute, setSelectedRoute] = useState(null);

    const routes = nearbyPlaces?.routes || [];
    const nearbyMarkers = nearbyPlaces?.nearbyMarkers || [];
    const loading = placesLoading;
    const error = !loading && routes.length === 0 ? 'No safe places found nearby yet.' : '';

    // Auto-select first route when data arrives
    useEffect(() => {
        if (routes.length > 0 && !selectedRoute) setSelectedRoute(routes[0]);
    }, [routes, selectedRoute]);

    const cfg = selectedRoute ? RISK_CONFIG[selectedRoute.risk] : RISK_CONFIG.low;

    // Build markers including selected route destination highlighted
    const mapMarkers = nearbyMarkers.map(m => ({
        ...m,
        color: selectedRoute && m.lat === selectedRoute.lat && m.lng === selectedRoute.lng
            ? '#9B59B6' : m.color,
    }));

    return (
        <div className="min-h-screen pt-20" style={{ background: 'var(--bg)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-24">
                {/* Header */}
                <div className="text-center mb-10">
                    <span className="section-label"><Navigation size={13} /> Safe Route</span>
                    <h1 className="font-playfair font-black text-4xl sm:text-5xl mt-2 mb-3" style={{ color: 'var(--text)' }}>
                        Plan Your <span className="gradient-text">Safe Journey</span>
                    </h1>
                    <p className="text-base max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
                        Real nearby safe places found from your live location — police stations, hospitals, and more.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left — Routes list */}
                    <div className="flex flex-col gap-5">
                        <h2 className="font-montserrat font-bold text-sm" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            Nearby Safe Places
                        </h2>
                        {loading ? (
                            <div className="glass rounded-2xl p-8 flex flex-col items-center gap-3">
                                <Loader size={24} className="animate-spin" style={{ color: '#9B59B6' }} />
                                <p className="text-sm font-montserrat" style={{ color: 'var(--text-muted)' }}>
                                    Finding safe places near you...
                                </p>
                            </div>
                        ) : error ? (
                            <div className="glass rounded-2xl p-6 text-center">
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{error}</p>
                            </div>
                        ) : (
                            routes.map(route => {
                                const rc = RISK_CONFIG[route.risk];
                                const Icon = rc.icon;
                                const isSelected = selectedRoute?.id === route.id;
                                return (
                                    <button key={route.id} onClick={() => setSelectedRoute(route)}
                                        className="glass rounded-2xl p-5 text-left transition-all card-hover"
                                        style={{ border: isSelected ? `2px solid ${rc.color}` : '1px solid rgba(155,89,182,0.15)' }}>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-montserrat font-bold text-sm" style={{ color: 'var(--text)' }}>
                                                {route.name}
                                            </span>
                                            <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold"
                                                style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>
                                                <Icon size={11} /> {rc.label}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                                            <MapPin size={12} style={{ color: '#9B59B6' }} /> {route.from}
                                            <ChevronRight size={12} />
                                            <Navigation size={12} style={{ color: '#FF6B9D' }} /> {route.to}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs">
                                            <span style={{ color: 'var(--text-muted)' }}>📏 {route.distance}</span>
                                            <span style={{ color: 'var(--text-muted)' }}><Clock size={10} className="inline mr-1" />{route.duration}</span>
                                            {/* Safety bar */}
                                            <div className="flex-1">
                                                <div className="h-1.5 rounded-full" style={{ background: 'rgba(155,89,182,0.06)' }}>
                                                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${route.safety}%`, background: rc.color }} />
                                                </div>
                                            </div>
                                            <span className="font-bold font-montserrat" style={{ color: rc.color }}>{route.safety}%</span>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Center — Map + selected route detail */}
                    <div className="flex flex-col gap-5">
                        {/* Live Map */}
                        <LocationMap
                            lat={location.lat}
                            lng={location.lng}
                            label={location.city}
                            height={260}
                            zoom={14}
                            markers={mapMarkers}
                        />

                        {/* Selected route details */}
                        {selectedRoute && (
                            <div className="glass rounded-2xl p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <cfg.icon size={16} style={{ color: cfg.color }} />
                                    <h3 className="font-montserrat font-bold text-sm" style={{ color: 'var(--text)' }}>
                                        {selectedRoute.name}
                                    </h3>
                                </div>
                                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{selectedRoute.description}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {selectedRoute.features.map((f, i) => (
                                        <span key={i} className="text-xs px-2.5 py-1 rounded-full"
                                            style={{ background: 'rgba(155,89,182,0.1)', border: '1px solid rgba(155,89,182,0.2)', color: '#9B59B6' }}>
                                            ✓ {f}
                                        </span>
                                    ))}
                                </div>
                                {/* Navigate button */}
                                <a href={`https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${selectedRoute.lat},${selectedRoute.lng}&travelmode=walking`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="block w-full py-2.5 rounded-xl font-semibold font-montserrat text-sm text-center transition-all hover:opacity-90"
                                    style={{ background: 'linear-gradient(135deg, #9B59B6, #E0457B)', color: 'white' }}>
                                    🧭 Navigate in Google Maps
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Right — Risk Analyzer + Tips */}
                    <div className="flex flex-col gap-5">
                        <AreaRiskAnalyzer />
                        <div className="glass rounded-2xl p-5">
                            <h3 className="font-montserrat font-bold text-sm mb-4" style={{ color: 'var(--text)' }}>💡 Safety Tips</h3>
                            <div className="space-y-3">
                                {safetyTips.map((tip, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                                        className="flex items-start gap-3 p-3 rounded-xl"
                                        style={{ background: 'rgba(155,89,182,0.03)' }}>
                                        <span className="text-lg flex-shrink-0">{tip.icon}</span>
                                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{tip.tip}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
