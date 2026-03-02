import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
    const { login, signup } = useAuth();
    const [mode, setMode] = useState('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (mode === 'login') {
                const res = await login(email, password);
                if (!res.success) setError(res.error);
            } else {
                if (!name.trim()) { setError('Please enter your name'); setLoading(false); return; }
                const res = await signup(name, email, password);
                if (!res.success) setError(res.error);
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        }
        setLoading(false);
    };

    const switchMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login');
        setName(''); setEmail(''); setPassword(''); setError('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{
            background: 'linear-gradient(135deg, #F8F0FF 0%, #FFF0F5 30%, #F0F0FF 60%, #F5F0FF 100%)',
        }}>
            {/* Decorative background elements */}
            <div style={{
                position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,89,182,0.08), transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '-10%', left: '-5%', width: '350px', height: '350px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(224,69,123,0.06), transparent 70%)',
                pointerEvents: 'none',
            }} />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full max-w-md relative"
            >
                {/* Card */}
                <div className="rounded-3xl p-8 sm:p-10" style={{
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(155,89,182,0.12)',
                    boxShadow: '0 20px 60px rgba(155,89,182,0.08), 0 4px 20px rgba(0,0,0,0.04)',
                }}>
                    {/* Logo & Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
                            style={{
                                background: 'linear-gradient(135deg, rgba(155,89,182,0.15), rgba(224,69,123,0.1))',
                                border: '1.5px solid rgba(155,89,182,0.25)',
                            }}
                        >
                            <Shield size={30} style={{ color: '#9B59B6' }} />
                        </motion.div>
                        <h1 className="font-playfair font-black text-3xl mb-1" style={{ color: '#1A1A2E' }}>
                            Safe<span style={{ color: '#9B59B6' }}>Her</span>
                        </h1>
                        <p className="text-sm font-montserrat" style={{ color: '#6B6085' }}>
                            Guardian in Your Pocket 🛡️
                        </p>
                    </div>

                    {/* Mode Tabs */}
                    <div className="flex rounded-xl p-1 mb-6" style={{
                        background: 'rgba(155,89,182,0.06)',
                        border: '1px solid rgba(155,89,182,0.1)',
                    }}>
                        {['login', 'signup'].map((m) => (
                            <button key={m} onClick={() => { setMode(m); setName(''); setEmail(''); setPassword(''); setShowPass(false); setError(''); }}
                                className="flex-1 py-2.5 rounded-lg text-sm font-montserrat font-semibold transition-all duration-300"
                                style={{
                                    background: mode === m ? 'white' : 'transparent',
                                    color: mode === m ? '#9B59B6' : '#6B6085',
                                    boxShadow: mode === m ? '0 2px 8px rgba(155,89,182,0.1)' : 'none',
                                }}
                            >
                                {m === 'login' ? 'Sign In' : 'Create Account'}
                            </button>
                        ))}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                        {mode === 'signup' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                                <label className="block text-xs font-semibold mb-1.5 font-montserrat" style={{ color: '#6B6085' }}>Full Name</label>
                                <input
                                    type="text" value={name} onChange={e => setName(e.target.value)}
                                    placeholder="Your name" required autoComplete="off"
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                                    style={{ background: 'rgba(155,89,182,0.04)', border: '1px solid rgba(155,89,182,0.15)', color: '#1A1A2E' }}
                                    onFocus={e => e.target.style.borderColor = '#9B59B6'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(155,89,182,0.15)'}
                                />
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold mb-1.5 font-montserrat" style={{ color: '#6B6085' }}>Email</label>
                            <input
                                type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com" required autoComplete="off"
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                                style={{ background: 'rgba(155,89,182,0.04)', border: '1px solid rgba(155,89,182,0.15)', color: '#1A1A2E' }}
                                onFocus={e => e.target.style.borderColor = '#9B59B6'}
                                onBlur={e => e.target.style.borderColor = 'rgba(155,89,182,0.15)'}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold mb-1.5 font-montserrat" style={{ color: '#6B6085' }}>Password</label>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••" required minLength={6} autoComplete="new-password"
                                    className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none transition-all"
                                    style={{ background: 'rgba(155,89,182,0.04)', border: '1px solid rgba(155,89,182,0.15)', color: '#1A1A2E' }}
                                    onFocus={e => e.target.style.borderColor = '#9B59B6'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(155,89,182,0.15)'}
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#6B6085' }}>
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="text-xs px-3 py-2 rounded-lg"
                                style={{ color: '#E74C3C', background: 'rgba(231,76,60,0.06)', border: '1px solid rgba(231,76,60,0.15)' }}>
                                {error}
                            </motion.p>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full py-3.5 rounded-xl font-semibold font-montserrat text-sm transition-all"
                            style={{
                                background: 'linear-gradient(135deg, #9B59B6, #E0457B)',
                                color: 'white',
                                opacity: loading ? 0.7 : 1,
                                boxShadow: '0 4px 15px rgba(155,89,182,0.25)',
                            }}>
                            {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    {/* Switch mode */}
                    <p className="text-center text-sm mt-6" style={{ color: '#6B6085' }}>
                        {mode === 'login' ? "New to SafeHer? " : 'Already have an account? '}
                        <button onClick={switchMode} className="font-semibold hover:underline" style={{ color: '#9B59B6' }}>
                            {mode === 'login' ? 'Create account' : 'Sign in'}
                        </button>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-xs mt-6 font-montserrat" style={{ color: '#8A7FA0' }}>
                    Your safety, your privacy — always protected 💜
                </p>
            </motion.div>
        </div>
    );
}
