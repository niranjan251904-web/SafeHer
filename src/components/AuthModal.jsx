import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
    const { isOpen, closeAuth, mode, setMode, login, signup } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Clear form fields whenever the modal opens
    useEffect(() => {
        if (isOpen) {
            setName('');
            setEmail('');
            setPassword('');
            setShowPass(false);
            setError('');
        }
    }, [isOpen]);

    const clearForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setShowPass(false);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (mode === 'login') {
                const res = await login(email, password);
                if (!res.success) setError(res.error);
                else clearForm();
            } else {
                if (!name.trim()) { setError('Please enter your name'); setLoading(false); return; }
                const res = await signup(name, email, password);
                if (!res.success) setError(res.error);
                else clearForm();
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        }
        setLoading(false);
    };

    const switchMode = (m) => { setMode(m); clearForm(); };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}
                    onClick={(e) => e.target === e.currentTarget && closeAuth()}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 20 }}
                        className="glass w-full max-w-md p-8 relative"
                    >
                        {/* Close */}
                        <button onClick={closeAuth} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-purple-50 transition-colors" style={{ color: '#6B6085' }}>
                            <X size={18} />
                        </button>

                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
                                style={{ background: 'linear-gradient(135deg, rgba(155,89,182,0.12), rgba(224,69,123,0.08))', border: '1.5px solid rgba(155,89,182,0.2)' }}>
                                <Shield size={26} style={{ color: '#9B59B6' }} />
                            </div>
                            <h2 className="font-playfair font-bold text-2xl mb-1" style={{ color: '#1A1A2E' }}>
                                {mode === 'login' ? 'Welcome Back' : 'Join SafeHer'}
                            </h2>
                            <p className="text-sm" style={{ color: '#6B6085' }}>
                                {mode === 'login' ? 'Sign in to your guardian account' : 'Create your safety profile'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                            {mode === 'signup' && (
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5 font-montserrat" style={{ color: '#6B6085' }}>Full Name</label>
                                    <input
                                        type="text" value={name} onChange={e => setName(e.target.value)}
                                        placeholder="Your name" required autoComplete="off"
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                                        style={{ background: 'rgba(155,89,182,0.04)', border: '1px solid rgba(155,89,182,0.15)', color: '#1A1A2E' }}
                                        onFocus={e => e.target.style.borderColor = '#9B59B6'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(155,89,182,0.15)'}
                                    />
                                </div>
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
                                    className="text-xs px-3 py-2 rounded-lg" style={{ color: '#E74C3C', background: 'rgba(231,76,60,0.06)', border: '1px solid rgba(231,76,60,0.15)' }}>
                                    {error}
                                </motion.p>
                            )}

                            <button type="submit" disabled={loading}
                                className="w-full py-3 rounded-xl font-semibold font-montserrat text-sm transition-all"
                                style={{ background: 'linear-gradient(135deg, #9B59B6, #E0457B)', color: 'white', opacity: loading ? 0.7 : 1 }}>
                                {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                            </button>
                        </form>

                        <p className="text-center text-sm mt-5" style={{ color: '#6B6085' }}>
                            {mode === 'login' ? "New to SafeHer? " : 'Already have an account? '}
                            <button onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                                className="font-semibold hover:underline" style={{ color: '#9B59B6' }}>
                                {mode === 'login' ? 'Join now' : 'Sign in'}
                            </button>
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
