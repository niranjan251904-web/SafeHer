import { NavLink } from 'react-router-dom';
import { Home, AlertTriangle, Map, Users, User } from 'lucide-react';
import { useSOS } from '../context/SOSContext';

const tabs = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/safe-route', label: 'Routes', icon: Map },
    { to: '/sos', label: 'SOS', icon: AlertTriangle, isSOS: true },
    { to: '/forum', label: 'Community', icon: Users },
    { to: '/profile', label: 'Profile', icon: User },
];

export default function MobileNav() {
    const { sosActive } = useSOS();

    return (
        <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
            <style>{`
                .mobile-bottom-nav {
                    display: none;
                    position: fixed;
                    bottom: 0; left: 0; right: 0;
                    z-index: 90;
                    background: rgba(255,255,255,0.97);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-top: 1px solid rgba(155,89,182,0.12);
                    padding: 6px 8px 10px;
                    box-shadow: 0 -2px 20px rgba(155,89,182,0.06);
                }
                @media (max-width: 767px) {
                    .mobile-bottom-nav { display: flex; justify-content: space-around; align-items: center; }
                }
                .mob-tab {
                    display: flex; flex-direction: column; align-items: center;
                    gap: 2px; padding: 4px 0;
                    text-decoration: none; position: relative;
                    flex: 1;
                    transition: all 0.2s ease;
                }
                .mob-tab span {
                    font-family: 'Montserrat', sans-serif;
                    font-size: 10px; font-weight: 600;
                    transition: color 0.2s ease;
                }
                .mob-tab .mob-icon {
                    width: 36px; height: 36px;
                    display: flex; align-items: center; justify-content: center;
                    border-radius: 12px;
                    transition: all 0.2s ease;
                }
                .mob-tab--default span { color: #9E9EB0; }
                .mob-tab--default .mob-icon { color: #9E9EB0; background: transparent; }
                .mob-tab--active span { color: #9B59B6; }
                .mob-tab--active .mob-icon { color: #9B59B6; background: rgba(155,89,182,0.1); }
                .mob-tab-sos .mob-icon {
                    width: 48px; height: 48px;
                    border-radius: 50%;
                    color: white !important;
                    margin-top: -18px;
                    box-shadow: 0 4px 15px rgba(231,76,60,0.35);
                }
                .mob-tab-sos--idle .mob-icon {
                    background: linear-gradient(135deg, #E74C3C, #C0392B) !important;
                }
                .mob-tab-sos--active .mob-icon {
                    background: #E74C3C !important;
                    animation: sosBtnPulse 1.2s ease-in-out infinite;
                }
                .mob-tab-sos span { color: #E74C3C !important; font-weight: 700; }
                @keyframes sosBtnPulse {
                    0%, 100% { box-shadow: 0 4px 15px rgba(231,76,60,0.35); transform: scale(1); }
                    50% { box-shadow: 0 4px 25px rgba(231,76,60,0.55); transform: scale(1.05); }
                }
            `}</style>

            {tabs.map(tab => {
                const Icon = tab.icon;
                if (tab.isSOS) {
                    return (
                        <NavLink key={tab.to} to={tab.to}
                            className={`mob-tab mob-tab-sos ${sosActive ? 'mob-tab-sos--active' : 'mob-tab-sos--idle'}`}>
                            <div className="mob-icon"><Icon size={22} /></div>
                            <span>{sosActive ? 'ACTIVE' : tab.label}</span>
                        </NavLink>
                    );
                }
                return (
                    <NavLink key={tab.to} to={tab.to} end={tab.to === '/'}
                        className={({ isActive }) =>
                            `mob-tab ${isActive ? 'mob-tab--active' : 'mob-tab--default'}`
                        }>
                        <div className="mob-icon"><Icon size={20} /></div>
                        <span>{tab.label}</span>
                    </NavLink>
                );
            })}
        </nav>
    );
}
