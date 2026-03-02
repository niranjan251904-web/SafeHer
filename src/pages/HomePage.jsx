import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Phone, BookOpen, Users, ArrowRight, Star, MapPin, AlertTriangle, Zap } from 'lucide-react';
import HelplineTicker from '../components/HelplineTicker';
import CountUpStat from '../components/CountUpStat';
import AreaRiskAnalyzer from '../components/AreaRiskAnalyzer';
import { statsData, impactStats } from '../data/statsData';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.55, ease: 'easeOut' } }),
};

const MODULE_CARDS = [
    { icon: Phone, label: 'Emergency SOS', desc: 'Hold-to-activate SOS. 3-second alert to contacts & authorities.', to: '/sos', color: '#E74C3C' },
    { icon: BookOpen, label: 'Safety Resources', desc: 'Legal rights, cyber safety, national helplines and more.', to: '/resources', color: '#9B59B6' },
    { icon: Users, label: 'Community Forum', desc: 'Real stories, safety tips, and peer support.', to: '/forum', color: '#FF6B9D' },
    { icon: MapPin, label: 'Safe Route', desc: 'AI-powered route analysis with risk zone alerts.', to: '/safe-route', color: '#F39C12' },
];

const TESTIMONIALS = [
    { name: 'Priya M.', city: 'Delhi', text: 'SafeHer literally saved me. SOS alerted my family in seconds when I was being followed. Life-changing.', rating: 5 },
    { name: 'Ananya K.', city: 'Mumbai', text: 'The Legal Rights section helped me understand my POSH rights and file a complaint against my harasser at work.', rating: 5 },
    { name: 'Sana R.', city: 'Hyderabad', text: 'Safe Route shows danger zones before I travel. I feel infinitely more confident going out alone now.', rating: 5 },
];

export default function HomePage() {
    return (
        <div style={{ background: 'var(--bg)' }}>

            {/* ═══════════════════════════════════════
          HERO — full-screen video background
      ═══════════════════════════════════════ */}
            <section className="relative overflow-hidden flex flex-col" style={{ minHeight: '100svh' }}>

                {/* Full-viewport video */}
                <video
                    src="/hero-shield.mp4"
                    autoPlay loop muted playsInline
                    className="absolute inset-0 w-full h-full"
                    style={{ objectFit: 'cover', objectPosition: 'center', zIndex: 0 }}
                />


                {/* ── Hero content ── */}
                <div
                    className="relative flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-12"
                    style={{ zIndex: 2, paddingTop: 'clamp(6rem, 14vh, 10rem)', paddingBottom: '2rem' }}
                >
                    {/* Badge */}
                    <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
                        <span className="section-label" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.7)' }}>
                            <Shield size={13} /> Guardian Platform
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        variants={fadeUp} initial="hidden" animate="show" custom={1}
                        className="font-playfair font-black leading-tight mt-3 mb-5"
                        style={{
                            fontSize: 'clamp(2.3rem, 6vw, 5.2rem)',
                            color: '#FFFFFF',
                            maxWidth: 'min(720px, 90vw)',
                            textShadow: '0 2px 16px rgba(0,0,0,0.8), 0 0px 6px rgba(0,0,0,0.5)',
                        }}
                    >
                        Your Safety,{' '}
                        <span className="gradient-text" style={{ textShadow: '0 2px 16px rgba(0,0,0,0.8)' }}>Our Mission.</span>
                        <br />
                        <span style={{ color: '#FF6B9D', textShadow: '0 2px 16px rgba(0,0,0,0.8)' }}>Always.</span>
                    </motion.h1>

                    {/* Sub-text */}
                    <motion.p
                        variants={fadeUp} initial="hidden" animate="show" custom={2}
                        className="text-base sm:text-lg leading-relaxed mb-8"
                        style={{ color: '#E8E0F0', maxWidth: 'min(540px, 90vw)', textShadow: '0 1px 10px rgba(0,0,0,0.8)' }}
                    >
                        SafeHer is a smart safety platform empowering women with emergency SOS, legal help, safe route planning, and a community that never lets you feel alone.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        variants={fadeUp} initial="hidden" animate="show" custom={3}
                        className="flex flex-wrap gap-4 mb-8"
                    >
                        <Link to="/sos">
                            <button
                                className="flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold font-montserrat text-sm transition-all hover:scale-105"
                                style={{ background: 'linear-gradient(135deg, #E74C3C, #c0392b)', color: 'white', boxShadow: '0 8px 30px rgba(231,76,60,0.55)' }}
                            >
                                🚨 Emergency SOS <ArrowRight size={16} />
                            </button>
                        </Link>
                        <Link to="/resources">
                            <button className="btn-secondary flex items-center gap-2 hover:scale-105 transition-all">
                                Explore Resources <ArrowRight size={16} />
                            </button>
                        </Link>
                    </motion.div>

                    {/* Trust badges */}
                    <motion.div
                        variants={fadeUp} initial="hidden" animate="show" custom={4}
                        className="flex flex-wrap gap-5"
                    >
                        {['100% Free', '24/7 Support', 'Govt. Backed Data'].map(item => (
                            <span key={item} className="flex items-center gap-1.5 text-sm" style={{ color: '#D0C4E0', textShadow: '0 1px 8px rgba(0,0,0,0.7)' }}>
                                <span style={{ color: '#27AE60' }}>✓</span> {item}
                            </span>
                        ))}
                    </motion.div>
                </div>

                {/* ── Helpline Ticker — sits at the very bottom of the hero, still inside the video section ── */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <HelplineTicker />
                </div>
            </section>

            {/* ═══════════════════════════════════════
          STATS
      ═══════════════════════════════════════ */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5"
                    style={{ background: 'radial-gradient(ellipse at center, #9B59B6, transparent 70%)' }} />
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="text-center mb-14">
                        <span className="section-label"><Zap size={13} /> Impact Numbers</span>
                        <h2 className="font-playfair font-bold text-3xl sm:text-4xl mt-2" style={{ color: 'var(--text)' }}>
                            Protecting Women, <span className="gradient-text">Every Day</span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
                        {statsData.map((stat, i) => (
                            <motion.div key={stat.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                className="glass-light p-6 text-center rounded-2xl card-hover">
                                <div className="text-3xl mb-2">{stat.icon}</div>
                                <div className="font-playfair font-black text-3xl sm:text-4xl mb-1" style={{ color: stat.color }}>
                                    <CountUpStat end={stat.value} suffix={stat.suffix} />
                                </div>
                                <div className="font-montserrat font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>{stat.label}</div>
                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.description}</div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {impactStats.map((item, i) => (
                            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                className="flex items-center gap-3 p-4 rounded-xl"
                                style={{ background: 'rgba(155,89,182,0.07)', border: '1px solid rgba(155,89,182,0.12)' }}>
                                <span className="text-2xl">{item.icon}</span>
                                <div>
                                    <div className="font-montserrat font-bold text-base" style={{ color: 'var(--text)' }}>{item.value}</div>
                                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════
          MODULE CARDS
      ═══════════════════════════════════════ */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="text-center mb-14">
                        <span className="section-label"><Shield size={13} /> Platform Modules</span>
                        <h2 className="font-playfair font-bold text-3xl sm:text-4xl mt-2" style={{ color: 'var(--text)' }}>
                            Everything You Need to <span className="gradient-text">Stay Safe</span>
                        </h2>
                        <p className="mt-3 text-base max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
                            One platform, complete protection — from real-time SOS to legal awareness.
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {MODULE_CARDS.map((card, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                                <Link to={card.to}>
                                    <div className="glass p-6 rounded-2xl card-hover group h-full">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                                            style={{ background: `${card.color}22` }}>
                                            <card.icon size={22} style={{ color: card.color }} />
                                        </div>
                                        <h3 className="font-montserrat font-bold text-base mb-2" style={{ color: 'var(--text)' }}>{card.label}</h3>
                                        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>{card.desc}</p>
                                        <div className="flex items-center gap-1 text-sm font-semibold font-montserrat" style={{ color: card.color }}>
                                            Explore <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════
          AREA RISK ANALYZER
      ═══════════════════════════════════════ */}
            <section className="py-20" style={{ background: 'rgba(155,89,182,0.03)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid lg:grid-cols-2 gap-10 items-center">
                        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                            <span className="section-label"><AlertTriangle size={13} /> Risk Intelligence</span>
                            <h2 className="font-playfair font-bold text-3xl sm:text-4xl mt-2 mb-4" style={{ color: 'var(--text)' }}>
                                Know Before You <span className="gradient-text">Go</span>
                            </h2>
                            <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
                                Our area risk analyzer scores locations based on CCTV density, historical incidents, lighting, and patrol activity — giving you real-time safety intelligence before you step out.
                            </p>
                            <Link to="/safe-route">
                                <button className="btn-primary flex items-center gap-2">
                                    View Full Map <ArrowRight size={16} />
                                </button>
                            </Link>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                            <AreaRiskAnalyzer />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════ */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="text-center mb-14">
                        <span className="section-label">💜 Community Voices</span>
                        <h2 className="font-playfair font-bold text-3xl sm:text-4xl mt-2" style={{ color: 'var(--text)' }}>
                            Real Stories, <span className="gradient-text">Real Impact</span>
                        </h2>
                    </motion.div>

                    <div className="grid sm:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                className="glass p-6 rounded-2xl card-hover">
                                <div className="flex gap-1 mb-4">
                                    {Array(t.rating).fill(0).map((_, j) => (
                                        <Star key={j} size={14} fill="#F39C12" style={{ color: '#F39C12' }} />
                                    ))}
                                </div>
                                <p className="text-sm leading-relaxed mb-5 italic" style={{ color: 'var(--text-muted)' }}>"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                        style={{ background: 'linear-gradient(135deg, #9B59B6, #FF6B9D)' }}>
                                        {t.name.slice(0, 2)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold font-montserrat" style={{ color: 'var(--text)' }}>{t.name}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.city}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════ */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0"
                    style={{ background: 'radial-gradient(ellipse at center, rgba(155,89,182,0.15) 0%, transparent 70%)' }} />
                <div className="relative max-w-3xl mx-auto px-4 text-center">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                        <div className="mb-6 text-6xl">🛡️</div>
                        <h2 className="font-playfair font-black text-4xl sm:text-5xl mb-5" style={{ color: 'var(--text)' }}>
                            "Technology should not just connect people —{' '}
                            <span className="gradient-text">it should protect them.</span>"
                        </h2>
                        <p className="text-base mb-8" style={{ color: 'var(--text-muted)' }}>
                            Join 847,000+ women who trust SafeHer as their digital guardian.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link to="/sos">
                                <button className="flex items-center gap-2 px-8 py-4 rounded-full font-bold font-montserrat"
                                    style={{ background: 'linear-gradient(135deg, #9B59B6, #FF6B9D)', color: 'white', fontSize: '1rem', boxShadow: '0 8px 30px rgba(155,89,182,0.4)' }}>
                                    <Shield size={18} /> Start Your Safety Journey
                                </button>
                            </Link>
                            <Link to="/forum">
                                <button className="btn-secondary flex items-center gap-2 px-7 py-4">
                                    <Users size={16} /> Join Community
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

        </div>
    );
}
