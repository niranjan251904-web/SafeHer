import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, BookOpen, Shield, ExternalLink, ChevronDown, ChevronUp, Search, AlertTriangle } from 'lucide-react';
import { helplines } from '../data/helplines';
import { legalRights, legalCategories } from '../data/legalRights';
import { cybercrimeData, cyberResources } from '../data/cybercrimeData';

const TABS = [
    { id: 'helplines', label: 'Helplines', icon: Phone },
    { id: 'legal', label: 'Legal Rights', icon: BookOpen },
    { id: 'cyber', label: 'Cybercrime', icon: Shield },
];

function HelplinesTab() {
    const [search, setSearch] = useState('');
    const filtered = helplines.filter(h =>
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.number.includes(search) ||
        h.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            {/* Search */}
            <div className="relative mb-6">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                    type="text" placeholder="Search helplines..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(155,89,182,0.04)', border: '1px solid rgba(155,89,182,0.2)', color: 'var(--text)' }}
                />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(h => (
                    <motion.div key={h.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="glass-light p-5 rounded-xl card-hover">
                        <div className="flex items-start gap-3 mb-3">
                            <span className="text-2xl">{h.icon}</span>
                            <div className="flex-1">
                                <h3 className="font-montserrat font-bold text-sm" style={{ color: 'var(--text)' }}>{h.name}</h3>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{h.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <a href={`tel:${h.number}`}
                                className="font-playfair font-bold text-xl hover:scale-105 transition-transform inline-block"
                                style={{ color: h.color }}>
                                {h.number}
                            </a>
                            <span className="text-xs px-2 py-0.5 rounded-full font-montserrat font-semibold"
                                style={{ background: 'rgba(39,174,96,0.1)', color: '#27AE60', border: '1px solid rgba(39,174,96,0.2)' }}>
                                {h.available}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function LegalRightsTab() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [expanded, setExpanded] = useState(null);

    const filtered = legalRights.filter(l => activeCategory === 'all' || l.category === activeCategory);

    return (
        <div>
            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-6">
                {legalCategories.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)}
                        className="px-4 py-1.5 rounded-full text-xs font-montserrat font-semibold capitalize transition-all"
                        style={{
                            background: activeCategory === cat ? 'rgba(155,89,182,0.25)' : 'rgba(155,89,182,0.04)',
                            border: `1px solid ${activeCategory === cat ? 'rgba(155,89,182,0.5)' : 'rgba(155,89,182,0.15)'}`,
                            color: activeCategory === cat ? '#9B59B6' : 'var(--text-muted)',
                        }}>
                        {cat.replace('-', ' ')}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filtered.map(right => (
                    <motion.div key={right.id} layout className="glass rounded-2xl overflow-hidden card-hover">
                        <button onClick={() => setExpanded(expanded === right.id ? null : right.id)}
                            className="w-full flex items-center gap-4 p-5 text-left">
                            <span className="text-2xl flex-shrink-0">{right.icon}</span>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-montserrat font-bold text-sm mb-0.5" style={{ color: 'var(--text)' }}>{right.title}</h3>
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(155,89,182,0.1)', color: '#9B59B6' }}>{right.act}</span>
                            </div>
                            {expanded === right.id ? <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />}
                        </button>
                        <AnimatePresence>
                            {expanded === right.id && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                                    className="px-5 pb-5">
                                    <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{right.description}</p>
                                    <div className="space-y-2">
                                        {right.keyPoints.map((kp, i) => (
                                            <div key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text)' }}>
                                                <span style={{ color: right.color, flexShrink: 0 }}>•</span> {kp}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function CybercrimeTab() {
    const [expanded, setExpanded] = useState(null);

    return (
        <div>
            {/* Cyber resources */}
            <div className="flex flex-wrap gap-3 mb-6">
                {cyberResources.map(r => (
                    <a key={r.name} href={r.url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-montserrat font-medium transition-all hover:bg-opacity-20"
                        style={{ background: 'rgba(52,152,219,0.1)', border: '1px solid rgba(52,152,219,0.25)', color: '#3498DB' }}>
                        {r.icon} {r.name} <ExternalLink size={11} />
                    </a>
                ))}
            </div>

            <div className="space-y-4">
                {cybercrimeData.map(crime => (
                    <motion.div key={crime.id} layout className="glass rounded-2xl overflow-hidden card-hover">
                        <button onClick={() => setExpanded(expanded === crime.id ? null : crime.id)}
                            className="w-full flex items-center gap-4 p-5 text-left">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: `rgba(${crime.color === '#E74C3C' ? '231,76,60' : crime.color === '#9B59B6' ? '155,89,182' : '255,107,157'},0.15)` }}>
                                <span className="text-lg">{crime.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-montserrat font-bold text-sm mb-0.5" style={{ color: 'var(--text)' }}>{crime.title}</h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs px-2 py-0.5 rounded-full"
                                        style={{ background: 'rgba(231,76,60,0.1)', color: '#E74C3C', border: '1px solid rgba(231,76,60,0.2)' }}>
                                        ⚖️ {crime.laws.split(',')[0]}
                                    </span>
                                    <span className="text-xs" style={{ color: '#E74C3C' }}>🔒 {crime.punishment}</span>
                                </div>
                            </div>
                            {expanded === crime.id ? <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />}
                        </button>
                        <AnimatePresence>
                            {expanded === crime.id && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                                    className="px-5 pb-5">
                                    <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{crime.description}</p>
                                    <div className="p-4 rounded-xl mb-3" style={{ background: 'rgba(52,152,219,0.06)', border: '1px solid rgba(52,152,219,0.15)' }}>
                                        <p className="text-xs font-montserrat font-bold mb-2" style={{ color: '#3498DB' }}>WHAT TO DO:</p>
                                        {crime.steps.map((step, i) => (
                                            <div key={i} className="flex items-start gap-2 text-sm mb-1.5" style={{ color: 'var(--text)' }}>
                                                <span className="font-bold flex-shrink-0" style={{ color: '#F39C12' }}>{i + 1}.</span> {step}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default function ResourcesPage() {
    const [tab, setTab] = useState('helplines');

    return (
        <div className="min-h-screen pt-20" style={{ background: 'var(--bg)' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-24">
                {/* Header */}
                <div className="text-center mb-10">
                    <span className="section-label"><BookOpen size={13} /> Safety Resources</span>
                    <h1 className="font-playfair font-black text-4xl sm:text-5xl mt-2 mb-3" style={{ color: 'var(--text)' }}>
                        Knowledge is <span className="gradient-text">Your Shield</span>
                    </h1>
                    <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
                        Everything you need — helplines, legal rights, and cybercrime guidance — in one place.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="flex p-1 rounded-2xl gap-1" style={{ background: 'rgba(155,89,182,0.04)', border: '1px solid rgba(155,89,182,0.15)' }}>
                        {TABS.map(t => (
                            <button key={t.id} onClick={() => setTab(t.id)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-montserrat font-semibold transition-all"
                                style={{
                                    background: tab === t.id ? 'linear-gradient(135deg, #9B59B6, #7B2D8B)' : 'transparent',
                                    color: tab === t.id ? 'white' : 'var(--text-muted)',
                                    boxShadow: tab === t.id ? '0 4px 15px rgba(155,89,182,0.3)' : 'none',
                                }}>
                                <t.icon size={15} /> {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        {tab === 'helplines' && <HelplinesTab />}
                        {tab === 'legal' && <LegalRightsTab />}
                        {tab === 'cyber' && <CybercrimeTab />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
