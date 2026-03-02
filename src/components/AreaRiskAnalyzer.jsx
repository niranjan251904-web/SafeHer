import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp, Shield, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { useSOS } from '../context/SOSContext';

const RISK_CONFIG = {
    low: { label: 'Safe', color: '#27AE60', bg: 'rgba(39,174,96,0.08)', border: 'rgba(39,174,96,0.2)', icon: CheckCircle },
    medium: { label: 'Moderate', color: '#F39C12', bg: 'rgba(243,156,18,0.08)', border: 'rgba(243,156,18,0.2)', icon: AlertTriangle },
    high: { label: 'High Risk', color: '#E74C3C', bg: 'rgba(231,76,60,0.08)', border: 'rgba(231,76,60,0.2)', icon: AlertTriangle },
};

export default function AreaRiskAnalyzer() {
    const { location, nearbyPlaces, placesLoading } = useSOS();

    // Compute risk score from centralized nearby places data
    const places = nearbyPlaces?.places || [];
    const policeCount = places.filter(p => p.type === 'police').length;
    const hospitalCount = places.filter(p => p.type === 'hospital').length;
    const totalPlaces = places.length;

    let score = 50;
    score += Math.min(policeCount * 12, 25);
    score += Math.min(hospitalCount * 8, 15);
    score += Math.min(totalPlaces * 3, 10);
    score = Math.min(score, 98);

    const risk = score >= 75 ? 'low' : score >= 50 ? 'medium' : 'high';

    const tips = [];
    if (policeCount > 0) tips.push(`${policeCount} police station${policeCount > 1 ? 's' : ''} within 2.5 km`);
    else tips.push('No police station nearby — stay alert');
    if (hospitalCount > 0) tips.push(`${hospitalCount} hospital${hospitalCount > 1 ? 's' : ''} within 2.5 km`);
    else tips.push('No hospital nearby — note emergency numbers');
    if (totalPlaces >= 5) tips.push('Good safety infrastructure nearby');
    else tips.push('Limited safety infrastructure — stay on main roads');
    tips.push('Keep SafeHer SOS ready while travelling');

    if (placesLoading) {
        return (
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-xl" style={{ background: 'rgba(155,89,182,0.08)' }}>
                        <TrendingUp size={20} style={{ color: '#9B59B6' }} />
                    </div>
                    <div>
                        <h3 className="font-montserrat font-bold text-base" style={{ color: '#1A1A2E' }}>Area Risk Analyzer</h3>
                        <p className="text-xs" style={{ color: '#6B6085' }}>Analyzing your area...</p>
                    </div>
                </div>
                <div className="flex items-center justify-center py-8">
                    <Loader size={24} className="animate-spin" style={{ color: '#9B59B6' }} />
                </div>
            </div>
        );
    }

    const cfg = RISK_CONFIG[risk];
    const Icon = cfg.icon;

    // Get area names from nearby places
    const areaNames = [...new Set(places.map(p => p.name))].slice(0, 4);

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

            {/* Current Location */}
            <p className="text-xs font-montserrat font-semibold mb-3 flex items-center gap-1.5" style={{ color: '#6B6085' }}>
                <MapPin size={11} style={{ color: '#9B59B6' }} />
                📍 {location?.city || 'Your Location'}
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(155,89,182,0.1)', color: '#9B59B6' }}>Live</span>
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
                                strokeDasharray={`${score} ${100 - score}`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center font-bold text-sm font-montserrat" style={{ color: cfg.color }}>
                            {score}
                        </span>
                    </div>
                </div>

                {/* Safety Tips */}
                <div className="space-y-1.5">
                    {tips.map((tip, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs" style={{ color: '#1A1A2E' }}>
                            <Shield size={11} style={{ color: cfg.color, flexShrink: 0 }} />
                            {tip}
                        </div>
                    ))}
                </div>

                {/* Infrastructure summary */}
                <div className="mt-3 pt-3 flex flex-wrap gap-3" style={{ borderTop: `1px solid ${cfg.border}` }}>
                    <span className="text-xs font-montserrat" style={{ color: '#6B6085' }}>
                        🚓 {policeCount} police
                    </span>
                    <span className="text-xs font-montserrat" style={{ color: '#6B6085' }}>
                        🏥 {hospitalCount} hospitals
                    </span>
                    <span className="text-xs font-montserrat" style={{ color: '#6B6085' }}>
                        📍 {totalPlaces} total places
                    </span>
                </div>
            </motion.div>
        </div>
    );
}
