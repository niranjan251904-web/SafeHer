import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Menu, X, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSOS } from '../context/SOSContext';

const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/sos', label: 'SOS' },
    { to: '/resources', label: 'Resources' },
    { to: '/forum', label: 'Community' },
    { to: '/safe-route', label: 'Safe Route' },
    { to: '/profile', label: 'Profile' },
];

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [userMenu, setUserMenu] = useState(false);
    const { user, logout, openAuth } = useAuth();
    const { sosActive } = useSOS();
    const navigate = useNavigate();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <>
            {/* SOS Active Banner */}
            <AnimatePresence>
                {sosActive && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="alert-flash fixed top-0 left-0 right-0 z-[100] flex items-center justify-center py-2 text-white text-sm font-semibold font-montserrat"
                        style={{ background: 'rgba(231,76,60,0.9)' }}
                    >
                        <span className="heartbeat-dot inline-block mr-2" /> 🚨 SOS ACTIVE — Emergency contacts notified
                    </motion.div>
                )}
            </AnimatePresence>

            <nav
                className={`fixed left-0 right-0 z-50 transition-all duration-300 ${sosActive ? 'top-9' : 'top-0'} ${scrolled ? 'py-3' : 'py-4'
                    }`}
                style={{
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(155,89,182,0.12)',
                    boxShadow: scrolled ? '0 2px 12px rgba(155,89,182,0.06)' : 'none',
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="relative">
                            <Shield size={28} className="text-primary group-hover:animate-pulse-shield" style={{ color: '#9B59B6' }} />
                            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ background: 'radial-gradient(circle, rgba(155,89,182,0.15), transparent)' }} />
                        </div>
                        <span className="font-playfair font-bold text-xl" style={{ color: '#1A1A2E' }}>
                            Safe<span className="gradient-text-pink">Her</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map(link => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                style={({ isActive }) => isActive ? { color: '#1A1A2E' } : {}}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </div>

                    {/* Right actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={() => navigate('/sos')}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold font-montserrat transition-all"
                            style={{
                                background: sosActive ? 'rgba(231,76,60,0.12)' : 'rgba(231,76,60,0.06)',
                                border: '1px solid rgba(231,76,60,0.3)',
                                color: '#E74C3C'
                            }}
                        >
                            <span className={sosActive ? 'heartbeat-dot' : ''} style={{ width: 6, height: 6, borderRadius: '50%', background: '#E74C3C', display: 'inline-block' }} />
                            SOS
                        </button>

                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenu(!userMenu)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-montserrat font-medium transition-all hover:bg-purple-50"
                                    style={{ border: '1px solid rgba(155,89,182,0.2)', color: '#1A1A2E' }}
                                >
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                        style={{ background: 'linear-gradient(135deg, #9B59B6, #E0457B)' }}>
                                        {user.avatar}
                                    </div>
                                    <span>{user.name.split(' ')[0]}</span>
                                    <ChevronDown size={14} />
                                </button>
                                <AnimatePresence>
                                    {userMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            className="absolute right-0 mt-2 w-44 glass rounded-xl overflow-hidden"
                                        >
                                            <Link to="/profile" onClick={() => setUserMenu(false)}
                                                className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-purple-50 transition-colors"
                                                style={{ color: '#1A1A2E' }}>
                                                <User size={15} /> My Profile
                                            </Link>
                                            <button onClick={() => { logout(); setUserMenu(false); }}
                                                className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-purple-50 transition-colors"
                                                style={{ color: '#E0457B' }}>
                                                <LogOut size={15} /> Sign Out
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <button onClick={() => openAuth('login')} className="btn-primary text-sm py-2 px-5">
                                Sign In
                            </button>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2" style={{ color: '#1A1A2E' }}>
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden mobile-menu mt-2 px-4 pb-4"
                        >
                            <div className="flex flex-col gap-1 pt-2">
                                {navLinks.map(link => (
                                    <NavLink
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => setMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `px-4 py-3 rounded-lg text-sm font-montserrat font-medium transition-all ${isActive ? 'bg-purple-100 text-purple-800' : 'text-gray-500 hover:text-gray-800 hover:bg-purple-50'
                                            }`
                                        }
                                    >
                                        {link.label}
                                    </NavLink>
                                ))}
                                {!user && (
                                    <button onClick={() => { openAuth('login'); setMenuOpen(false); }}
                                        className="btn-primary mt-2 text-sm py-2.5">
                                        Sign In
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </>
    );
}
