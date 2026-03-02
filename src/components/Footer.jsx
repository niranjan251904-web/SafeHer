import { Link } from 'react-router-dom';
import { Shield, Heart, Github, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
    return (
        <footer style={{ background: '#F3F0F8', borderTop: '1px solid rgba(155,89,182,0.12)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield size={24} style={{ color: '#9B59B6' }} />
                            <span className="font-playfair font-bold text-xl" style={{ color: '#1A1A2E' }}>
                                Safe<span className="gradient-text-pink">Her</span>
                            </span>
                        </div>
                        <p className="text-sm mb-5 leading-relaxed max-w-sm" style={{ color: '#6B6085' }}>
                            "Technology should not just connect people — it should protect them." 🛡️
                            SafeHer is a guardian in your pocket, empowering every woman with tools for safety, knowledge, and community.
                        </p>
                        <div className="flex items-center gap-3">
                            {[Github, Twitter, Instagram].map((Icon, i) => (
                                <button key={i} className="p-2 rounded-full hover:bg-purple-100 transition-colors" style={{ border: '1px solid rgba(155,89,182,0.15)', color: '#6B6085' }}>
                                    <Icon size={16} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-montserrat font-semibold text-sm mb-4" style={{ color: '#1A1A2E' }}>Platform</h4>
                        <ul className="space-y-2.5">
                            {[
                                { to: '/', label: 'Home' },
                                { to: '/sos', label: 'Emergency SOS' },
                                { to: '/resources', label: 'Safety Resources' },
                                { to: '/forum', label: 'Community Forum' },
                                { to: '/safe-route', label: 'Safe Route' },
                                { to: '/profile', label: 'My Profile' },
                            ].map(link => (
                                <li key={link.to}>
                                    <Link to={link.to} className="text-sm hover:text-purple-700 transition-colors" style={{ color: '#6B6085' }}>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Emergency */}
                    <div>
                        <h4 className="font-montserrat font-semibold text-sm mb-4" style={{ color: '#1A1A2E' }}>Emergency</h4>
                        <ul className="space-y-2.5">
                            {[
                                { label: '🚨 National Emergency', num: '112' },
                                { label: '🛡️ Women Helpline', num: '1091' },
                                { label: '👮 Police', num: '100' },
                                { label: '🏠 Domestic Violence', num: '181' },
                                { label: '💻 Cyber Crime', num: '1930' },
                                { label: '🚑 Ambulance', num: '108' },
                            ].map((item, i) => (
                                <li key={i} className="flex items-center justify-between">
                                    <span className="text-sm" style={{ color: '#6B6085' }}>{item.label}</span>
                                    <a href={`tel:${item.num}`} className="text-sm font-semibold font-montserrat hover:text-purple-700 transition-colors" style={{ color: '#E0457B' }}>
                                        {item.num}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(155,89,182,0.1)' }}>
                    <p className="text-xs flex items-center gap-1.5" style={{ color: '#6B6085' }}>
                        Made with <Heart size={12} style={{ color: '#E0457B' }} fill="#E0457B" /> for every woman's safety —
                        <span style={{ color: '#9B59B6' }}> SafeHer © 2026</span>
                    </p>
                    <p className="text-xs" style={{ color: '#6B6085' }}>Demo Platform — Not a substitute for real emergency services</p>
                </div>
            </div>
        </footer>
    );
}
