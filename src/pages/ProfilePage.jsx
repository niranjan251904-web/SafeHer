import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Bell, Shield, Plus, Edit2, Trash2, History, X, Check } from 'lucide-react';
import { collection, addDoc, getDocs, deleteDoc, doc, getDoc, setDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useSOS } from '../context/SOSContext';
import { useAuth } from '../context/AuthContext';

const SETTINGS_DEFAULT = [
    { id: 'share_location', label: 'Auto-share location on SOS', enabled: true },
    { id: 'fake_call', label: 'Fake call feature enabled', enabled: true },
    { id: 'area_alerts', label: 'Area risk zone alerts', enabled: false },
    { id: 'community_notify', label: 'Community activity notifications', enabled: false },
    { id: 'nightly_checkin', label: 'Nightly safety check-in reminder', enabled: true },
];

const RELATIONS = ['Mother', 'Father', 'Sister', 'Brother', 'Friend', 'Partner', 'Other'];

/* ─── Add Contact Modal ─── */
function AddContactModal({ onClose, onAdd }) {
    const [form, setForm] = useState({ name: '', phone: '', email: '', relation: 'Friend' });
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name.trim()) { setError('Name is required.'); return; }
        if (!/^[\d\s+\-()]{7,15}$/.test(form.phone)) { setError('Enter a valid phone number.'); return; }
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Enter a valid email address.'); return; }
        onAdd(form);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }} transition={{ duration: 0.25 }}
                className="glass rounded-2xl p-7 w-full max-w-md" style={{ border: '1px solid rgba(155,89,182,0.3)' }}>

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-montserrat font-bold text-lg" style={{ color: 'var(--text)' }}>Add Emergency Contact</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors" style={{ color: 'var(--text-muted)' }}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-montserrat font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Full Name *</label>
                        <input
                            type="text" placeholder="e.g. Riya Sharma"
                            value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setError(''); }}
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                            style={{ background: 'rgba(155,89,182,0.06)', border: '1px solid rgba(155,89,182,0.25)', color: 'var(--text)' }}
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-xs font-montserrat font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Phone Number *</label>
                        <input
                            type="tel" placeholder="e.g. +91 98765 43210"
                            value={form.phone} onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setError(''); }}
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                            style={{ background: 'rgba(155,89,182,0.06)', border: '1px solid rgba(155,89,182,0.25)', color: 'var(--text)' }}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-montserrat font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Email <span className="opacity-60">(for SOS alerts)</span></label>
                        <input
                            type="email" placeholder="e.g. riya@gmail.com"
                            value={form.email} onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setError(''); }}
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                            style={{ background: 'rgba(155,89,182,0.06)', border: '1px solid rgba(155,89,182,0.25)', color: 'var(--text)' }}
                        />
                    </div>

                    {/* Relation */}
                    <div>
                        <label className="block text-xs font-montserrat font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Relation</label>
                        <div className="flex flex-wrap gap-2">
                            {RELATIONS.map(r => (
                                <button type="button" key={r} onClick={() => setForm(f => ({ ...f, relation: r }))}
                                    className="px-3 py-1.5 rounded-full text-xs font-montserrat font-semibold transition-all"
                                    style={{
                                        background: form.relation === r ? 'rgba(155,89,182,0.25)' : 'rgba(155,89,182,0.04)',
                                        border: `1px solid ${form.relation === r ? 'rgba(155,89,182,0.5)' : 'rgba(155,89,182,0.12)'}`,
                                        color: form.relation === r ? '#9B59B6' : 'var(--text-muted)',
                                    }}>
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(231,76,60,0.1)', color: '#E74C3C', border: '1px solid rgba(231,76,60,0.2)' }}>
                            ⚠ {error}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-3 rounded-xl text-sm font-montserrat font-semibold transition-all"
                            style={{ background: 'rgba(155,89,182,0.05)', border: '1px solid rgba(155,89,182,0.1)', color: 'var(--text-muted)' }}>
                            Cancel
                        </button>
                        <button type="submit"
                            className="flex-1 py-3 rounded-xl text-sm font-montserrat font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg, #9B59B6, #FF6B9D)', color: 'white', boxShadow: '0 4px 20px rgba(155,89,182,0.35)' }}>
                            <Check size={15} /> Save Contact
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default function ProfilePage() {
    const { user, openAuth } = useAuth();
    const { contacts, setContacts, sosActive, deactivateSOS } = useSOS();
    const [settings, setSettings] = useState(SETTINGS_DEFAULT);
    const [activeTab, setActiveTab] = useState('contacts');
    const [showAddModal, setShowAddModal] = useState(false);
    const [alertHistory, setAlertHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Load settings from Firestore
    useEffect(() => {
        if (!user?.uid) return;
        const loadSettings = async () => {
            try {
                const snap = await getDoc(doc(db, 'users', user.uid));
                if (snap.exists() && snap.data().settings) {
                    const saved = snap.data().settings;
                    setSettings(prev => prev.map(s => ({
                        ...s,
                        enabled: saved[s.id] !== undefined ? saved[s.id] : s.enabled,
                    })));
                }
            } catch (e) {
                console.warn('Could not load settings:', e);
            }
        };
        loadSettings();
    }, [user?.uid]);

    // Load alert history from Firestore
    useEffect(() => {
        if (!user?.uid || activeTab !== 'history') return;
        const loadHistory = async () => {
            setLoadingHistory(true);
            try {
                const q = query(
                    collection(db, 'sosAlerts'),
                    where('userId', '==', user.uid),
                    orderBy('timestamp', 'desc')
                );
                const snap = await getDocs(q);
                setAlertHistory(snap.docs.map(d => {
                    const data = d.data();
                    const date = new Date(data.timestamp);
                    return {
                        id: d.id,
                        type: 'SOS',
                        date: date.toLocaleDateString('en-IN'),
                        time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                        location: data.location?.city || 'Unknown',
                        status: data.status || 'Resolved',
                        color: data.status === 'Active' ? '#E74C3C' : '#27AE60',
                    };
                }));
            } catch (e) {
                console.warn('Could not load alert history:', e);
            }
            setLoadingHistory(false);
        };
        loadHistory();
    }, [user?.uid, activeTab]);

    if (!user) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <div className="text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="font-playfair font-bold text-2xl mb-3" style={{ color: 'var(--text)' }}>Sign In Required</h2>
                    <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Please sign in to access your SafeHer profile.</p>
                    <button onClick={() => openAuth('login')} className="btn-primary">Sign In to SafeHer</button>
                </div>
            </div>
        );
    }

    const toggleSetting = async (id) => {
        setSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
        // Persist to Firestore
        if (user?.uid) {
            try {
                const newSettings = {};
                settings.forEach(s => { newSettings[s.id] = s.id === id ? !s.enabled : s.enabled; });
                await setDoc(doc(db, 'users', user.uid), { settings: newSettings }, { merge: true });
            } catch (e) {
                console.warn('Could not save settings:', e);
            }
        }
    };

    const addContact = async (c) => {
        if (user?.uid) {
            try {
                const ref = await addDoc(collection(db, 'users', user.uid, 'contacts'), {
                    name: c.name, phone: c.phone, email: c.email || '', relation: c.relation,
                });
                setContacts(prev => [...prev, { ...c, id: ref.id }]);
            } catch (e) {
                console.warn('Could not save contact:', e);
                setContacts(prev => [...prev, { ...c, id: Date.now() }]);
            }
        } else {
            setContacts(prev => [...prev, { ...c, id: Date.now() }]);
        }
    };

    const removeContact = async (idx) => {
        const contact = contacts[idx];
        if (user?.uid && contact.id && typeof contact.id === 'string') {
            try {
                await deleteDoc(doc(db, 'users', user.uid, 'contacts', contact.id));
            } catch (e) {
                console.warn('Could not delete contact from Firestore:', e);
            }
        }
        setContacts(prev => prev.filter((_, i) => i !== idx));
    };

    const TABS = [
        { id: 'contacts', label: 'Emergency Contacts', icon: Phone },
        { id: 'history', label: 'Alert History', icon: History },
        { id: 'settings', label: 'Preferences', icon: Bell },
    ];

    return (
        <div className="min-h-screen pt-20" style={{ background: 'var(--bg)' }}>
            {/* Add Contact Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <AddContactModal onClose={() => setShowAddModal(false)} onAdd={addContact} />
                )}
            </AnimatePresence>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 pb-24">
                {/* Profile header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-3xl p-8 mb-8 flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #9B59B6, #FF6B9D)', boxShadow: '0 0 30px rgba(155,89,182,0.4)' }}>
                        {user.avatar}
                    </div>
                    <div className="text-center sm:text-left flex-1">
                        <h1 className="font-playfair font-bold text-2xl mb-1" style={{ color: 'var(--text)' }}>{user.name}</h1>
                        <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                            {['SafeHer Guardian', 'Community Member', 'Verified'].map(badge => (
                                <span key={badge} className="text-xs px-3 py-1 rounded-full font-montserrat font-semibold"
                                    style={{ background: 'rgba(155,89,182,0.15)', border: '1px solid rgba(155,89,182,0.25)', color: '#9B59B6' }}>
                                    {badge}
                                </span>
                            ))}
                        </div>
                    </div>
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                        {[{ v: contacts.length, l: 'Contacts' }, { v: alertHistory.length || '0', l: 'Alerts' }, { v: '12', l: 'Safe Routes' }].map(s => (
                            <div key={s.l}>
                                <div className="font-playfair font-bold text-2xl" style={{ color: '#9B59B6' }}>{s.v}</div>
                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.l}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Stop SOS Banner */}
                <AnimatePresence>
                    {sosActive && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4"
                            style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)' }}>
                            <div className="flex items-center gap-3">
                                <span className="heartbeat-dot" style={{ width: 10, height: 10, borderRadius: '50%', background: '#E74C3C', display: 'inline-block' }} />
                                <div>
                                    <p className="font-montserrat font-bold text-sm" style={{ color: '#E74C3C' }}>🚨 SOS is Active</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Emergency contacts have been notified</p>
                                </div>
                            </div>
                            <button onClick={deactivateSOS}
                                className="px-6 py-2.5 rounded-xl font-montserrat font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                                style={{ background: 'linear-gradient(135deg, #27AE60, #2ECC71)', color: 'white', boxShadow: '0 3px 14px rgba(39,174,96,0.3)' }}>
                                ✅ I'm Safe — Stop SOS
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tab strip */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-montserrat font-semibold whitespace-nowrap transition-all"
                            style={{
                                background: activeTab === t.id ? 'rgba(155,89,182,0.2)' : 'rgba(155,89,182,0.04)',
                                border: `1px solid ${activeTab === t.id ? 'rgba(155,89,182,0.4)' : 'rgba(155,89,182,0.12)'}`,
                                color: activeTab === t.id ? '#9B59B6' : 'var(--text-muted)',
                            }}>
                            <t.icon size={15} /> {t.label}
                        </button>
                    ))}
                </div>

                {/* ── Contacts Tab ── */}
                {activeTab === 'contacts' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="glass rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="font-montserrat font-bold text-base" style={{ color: 'var(--text)' }}>
                                    Emergency Contacts <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>({contacts.length})</span>
                                </h2>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="flex items-center gap-1.5 text-sm font-montserrat font-semibold px-4 py-2 rounded-xl transition-all hover:opacity-90 active:scale-95"
                                    style={{ background: 'linear-gradient(135deg, #9B59B6, #FF6B9D)', color: 'white', boxShadow: '0 3px 14px rgba(155,89,182,0.3)' }}>
                                    <Plus size={14} /> Add Contact
                                </button>
                            </div>

                            {contacts.length === 0 ? (
                                <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                                    <Phone size={32} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">No emergency contacts yet.</p>
                                    <p className="text-xs mt-1">Add contacts who will be alerted during SOS.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <AnimatePresence>
                                        {contacts.map((c, i) => (
                                            <motion.div key={c.id ?? i}
                                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10, height: 0, marginBottom: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="flex items-center gap-4 p-4 rounded-xl"
                                                style={{ background: 'rgba(155,89,182,0.04)' }}>
                                                <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                                                    style={{ background: 'linear-gradient(135deg, #9B59B6, #FF6B9D)' }}>
                                                    {c.name[0].toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-montserrat font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{c.name}</p>
                                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.phone} · {c.relation}</p>
                                                    {c.email && <p className="text-xs truncate" style={{ color: '#9B59B6' }}>✉ {c.email}</p>}
                                                </div>
                                                <div className="flex gap-1.5 flex-shrink-0">
                                                    <a href={`tel:${c.phone}`}
                                                        className="p-2 rounded-lg transition-colors"
                                                        style={{ color: '#27AE60', background: 'rgba(39,174,96,0.08)' }}
                                                        title="Call now">
                                                        <Phone size={14} />
                                                    </a>
                                                    <button onClick={() => removeContact(i)}
                                                        className="p-2 rounded-lg hover:bg-red-900/20 transition-colors" style={{ color: '#E74C3C' }}
                                                        title="Remove contact">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}

                            <div className="mt-4 p-4 rounded-xl text-sm" style={{ background: 'rgba(39,174,96,0.07)', border: '1px solid rgba(39,174,96,0.15)', color: '#27AE60' }}>
                                ✅ All contacts will be notified automatically when SOS is activated.
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── History Tab ── */}
                {activeTab === 'history' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="glass rounded-2xl p-6">
                            <h2 className="font-montserrat font-bold text-base mb-5" style={{ color: 'var(--text)' }}>Alert History</h2>
                            {loadingHistory ? (
                                <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                                    <p className="text-sm">Loading alert history...</p>
                                </div>
                            ) : alertHistory.length === 0 ? (
                                <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                                    <History size={32} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">No alert history yet.</p>
                                    <p className="text-xs mt-1">SOS alerts will appear here.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {alertHistory.map(h => (
                                        <div key={h.id} className="flex items-center gap-4 p-4 rounded-xl card-hover" style={{ background: 'rgba(155,89,182,0.04)' }}>
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                                style={{ background: `${h.color}20`, border: `1px solid ${h.color}40` }}>
                                                🚨
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-montserrat font-bold text-sm" style={{ color: 'var(--text)' }}>{h.type}</span>
                                                    <span className="text-xs px-2 py-0.5 rounded-full"
                                                        style={{ background: `${h.color}15`, color: h.color, border: `1px solid ${h.color}30` }}>
                                                        {h.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{h.location}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-montserrat" style={{ color: 'var(--text-muted)' }}>{h.date}</p>
                                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{h.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ── Settings Tab ── */}
                {activeTab === 'settings' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="glass rounded-2xl p-6">
                            <h2 className="font-montserrat font-bold text-base mb-5" style={{ color: 'var(--text)' }}>Safety Preferences</h2>
                            <div className="space-y-4">
                                {settings.map(s => (
                                    <div key={s.id} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(155,89,182,0.04)' }}>
                                        <p className="text-sm pr-4" style={{ color: 'var(--text)' }}>{s.label}</p>
                                        <button
                                            onClick={() => toggleSetting(s.id)}
                                            className="relative rounded-full transition-all flex-shrink-0"
                                            style={{
                                                width: 44, height: 24,
                                                background: s.enabled ? 'linear-gradient(135deg, #9B59B6, #FF6B9D)' : 'rgba(155,89,182,0.1)',
                                                boxShadow: s.enabled ? '0 0 10px rgba(155,89,182,0.4)' : 'none',
                                            }}>
                                            <div className="absolute top-[2px] w-5 h-5 rounded-full bg-white transition-all duration-200"
                                                style={{ left: s.enabled ? '20px' : '2px', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
