import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MapPin, Users, Shield, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import { useSOS } from '../context/SOSContext';
import { helplines } from '../data/helplines';
import LocationMap from '../components/LocationMap';

const LOG_COLORS = {
    sos: '#E74C3C', location: '#F39C12', contact: '#9B59B6',
    success: '#27AE60', police: '#3498DB', info: '#6B6085',
};

export default function SOSPage() {
    const { sosActive, alertLog, holdProgress, startHold, cancelHold, deactivateSOS, contacts, location, nearbyPlaces } = useSOS();
    const [showDeactivate, setShowDeactivate] = useState(false);

    // Use nearby markers from centralized context (hospitals & police only)
    const nearbyMarkers = (nearbyPlaces?.places || [])
        .filter(p => p.type === 'police' || p.type === 'hospital')
        .slice(0, 10)
        .map(p => ({
            lat: p.lat,
            lng: p.lng,
            label: `${p.icon} ${p.name} (${p.distanceText})`,
            color: p.type === 'police' ? '#3498DB' : '#27AE60',
        }));

    useEffect(() => { if (sosActive) setShowDeactivate(true); }, [sosActive]);

    const emergencyHelplines = helplines.filter(h => ['national', 'emergency', 'domestic', 'police'].includes(h.category)).slice(0, 6);

    return (
        <div className="min-h-screen pt-20" style={{ background: 'var(--bg)' }}>
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="text-center mb-2">
                    <span className="section-label"><AlertTriangle size={13} /> Emergency</span>
                    <h1 className="font-playfair font-black text-3xl sm:text-5xl mt-2" style={{ color: 'var(--text)' }}>
                        Emergency <span style={{ color: '#E74C3C' }}>SOS</span> System
                    </h1>
                    <p className="mt-3 text-base max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
                        Hold the button for 3 seconds to activate. Your location and emergency alert will be sent instantly.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* ─── SOS BUTTON PANEL ─── */}
                    <div className="lg:col-span-1 flex flex-col items-center gap-8">
                        {/* Main SOS button */}
                        <div className="glass w-full p-8 rounded-3xl flex flex-col items-center gap-6">
                            <div className="relative flex items-center justify-center">
                                {/* Glow rings */}
                                {sosActive && [100, 130, 160].map((size, i) => (
                                    <div key={i} className="sos-ring absolute" style={{
                                        width: size + '%', height: size + '%',
                                        animationDelay: `${i * 0.5}s`,
                                        borderColor: 'rgba(231,76,60,0.4)',
                                    }} />
                                ))}

                                {/* Hold Progress Ring */}
                                {!sosActive && holdProgress > 0 && (
                                    <svg className="absolute w-56 h-56 -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(231,76,60,0.15)" strokeWidth="4" />
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#E74C3C" strokeWidth="4"
                                            strokeDasharray={`${holdProgress * 2.83} ${283 - holdProgress * 2.83}`}
                                            strokeLinecap="round" className="progress-ring__circle"
                                        />
                                    </svg>
                                )}

                                <button
                                    className={`sos-btn select-none ${sosActive ? 'active' : ''}`}
                                    onMouseDown={startHold} onMouseUp={cancelHold}
                                    onTouchStart={startHold} onTouchEnd={cancelHold}
                                    onClick={() => { if (sosActive) { setShowDeactivate(true); } }}
                                >
                                    <span className="font-black text-white" style={{ fontSize: '2rem', fontFamily: 'Montserrat' }}>SOS</span>
                                    <span className="text-white text-xs font-montserrat font-medium opacity-80">
                                        {sosActive ? 'ACTIVE' : holdProgress > 0 ? `${Math.round(holdProgress)}%` : 'HOLD 3s'}
                                    </span>
                                </button>
                            </div>

                            <div className="text-center">
                                <p className="text-sm font-montserrat" style={{ color: 'var(--text-muted)' }}>
                                    {sosActive
                                        ? '🚨 Alert broadcasted — help is on the way'
                                        : 'Hold button for 3 seconds to activate SOS'}
                                </p>
                            </div>

                            {/* Deactivate button */}
                            {sosActive && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    onClick={deactivateSOS}
                                    className="w-full py-3 rounded-xl font-semibold font-montserrat text-sm transition-all"
                                    style={{ background: 'rgba(39,174,96,0.15)', border: '1px solid rgba(39,174,96,0.3)', color: '#27AE60' }}>
                                    ✅ I'm Safe — Deactivate
                                </motion.button>
                            )}

                            {/* Status */}
                            <div className="w-full p-4 rounded-xl" style={{ background: sosActive ? 'rgba(231,76,60,0.1)' : 'rgba(155,89,182,0.08)', border: `1px solid ${sosActive ? 'rgba(231,76,60,0.3)' : 'rgba(155,89,182,0.2)'}` }}>
                                <div className="flex items-center gap-2 text-sm font-montserrat font-semibold mb-2" style={{ color: sosActive ? '#E74C3C' : '#9B59B6' }}>
                                    {sosActive ? <><span className="heartbeat-dot" /> ALERT ACTIVE</> : <><Shield size={14} /> READY</>}
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                                    <div><span className="block font-semibold mb-0.5" style={{ color: 'var(--text)' }}>Location</span>{location.city}</div>
                                    <div><span className="block font-semibold mb-0.5" style={{ color: 'var(--text)' }}>Contacts</span>{contacts.length} added</div>
                                </div>
                            </div>
                        </div>

                        {/* Emergency contacts */}
                        <div className="glass w-full p-6 rounded-2xl">
                            <div className="flex items-center gap-2 mb-4">
                                <Users size={16} style={{ color: '#9B59B6' }} />
                                <h3 className="font-montserrat font-bold text-sm" style={{ color: 'var(--text)' }}>Emergency Contacts</h3>
                            </div>
                            <div className="space-y-3">
                                {contacts.map((c, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(155,89,182,0.04)' }}>
                                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                            style={{ background: 'linear-gradient(135deg, #9B59B6, #FF6B9D)' }}>
                                            {c.name[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold font-montserrat" style={{ color: 'var(--text)' }}>{c.name}</p>
                                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{c.phone} · {c.relation}</p>
                                            {c.email && <p className="text-xs truncate" style={{ color: '#9B59B6' }}>✉ {c.email}</p>}
                                        </div>
                                        {sosActive && <CheckCircle size={14} style={{ color: '#27AE60' }} />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ─── MAP + LOG ─── */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Live Map */}
                        <LocationMap
                            lat={location.lat}
                            lng={location.lng}
                            label={location.city}
                            isActive={sosActive}
                            height={280}
                            zoom={14}
                            markers={nearbyMarkers}
                        />

                        {/* Alert Log */}
                        <div className="glass rounded-2xl flex-1" style={{ minHeight: 280 }}>
                            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(155,89,182,0.15)' }}>
                                <div className="flex items-center gap-2">
                                    <Clock size={15} style={{ color: '#9B59B6' }} />
                                    <h3 className="font-montserrat font-bold text-sm" style={{ color: 'var(--text)' }}>Alert Log</h3>
                                    {sosActive && <span className="heartbeat-dot" />}
                                </div>
                                <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(155,89,182,0.1)', color: '#9B59B6' }}>
                                    {alertLog.length} events
                                </span>
                            </div>
                            <div className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 300 }}>
                                <AnimatePresence>
                                    {alertLog.length === 0 ? (
                                        <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
                                            No alerts yet. Activate SOS to begin.
                                        </div>
                                    ) : (
                                        alertLog.map(log => (
                                            <motion.div
                                                key={log.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex items-start gap-3 p-3 rounded-xl text-sm"
                                                style={{ background: `rgba(${log.type === 'sos' ? '231,76,60' : log.type === 'success' ? '39,174,96' : '155,89,182'},0.06)` }}
                                            >
                                                <span className="text-xs mt-0.5 flex-shrink-0 font-mono" style={{ color: 'var(--text-muted)' }}>{log.time}</span>
                                                <span style={{ color: LOG_COLORS[log.type] || 'var(--text)', fontFamily: 'Montserrat', fontSize: '0.8rem' }}>
                                                    {log.msg}
                                                </span>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Quick call helplines */}
                        <div className="glass rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Phone size={15} style={{ color: '#FF6B9D' }} />
                                <h3 className="font-montserrat font-bold text-sm" style={{ color: 'var(--text)' }}>Quick Call</h3>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {emergencyHelplines.map(h => (
                                    <a key={h.id} href={`tel:${h.number}`}
                                        className="flex flex-col items-center p-3 rounded-xl text-center transition-all hover:scale-105 card-hover"
                                        style={{ background: 'rgba(155,89,182,0.04)', border: '1px solid rgba(155,89,182,0.15)' }}>
                                        <span className="text-xl mb-1">{h.icon}</span>
                                        <span className="text-xs font-montserrat font-bold mb-0.5" style={{ color: 'var(--text)' }}>{h.number}</span>
                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{h.name}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
