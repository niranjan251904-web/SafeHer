import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Minimize2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
let chat = null;

// Initialize Gemini chat session
function getChat() {
    if (chat) return chat;
    if (!API_KEY) return null;
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    chat = model.startChat({
        history: [],
        generationConfig: { maxOutputTokens: 300 },
    });
    return chat;
}

const SYSTEM_PROMPT = `You are SafeBot, an AI safety assistant for SafeHer — a women's safety app. 
Your role:
- Help women with safety concerns, emergency guidance, legal rights
- Provide helpline numbers: Women Helpline 1091, Police 100, Emergency 112, Domestic Violence 181, Cyber Crime 1930
- Guide users on how to use SafeHer features (SOS button, emergency contacts, safe routes, forum)
- Be empathetic, supportive, and concise (max 3-4 lines per response)
- If someone is in immediate danger, tell them to use the SOS button or call 112
- Never provide harmful, inappropriate, or medical advice
Keep responses short, warm, and actionable. Use emojis sparingly. Always prioritize safety.`;

// Fallback for when Gemini is unavailable
const FALLBACK = {
    greet: "Hello! I'm SafeBot 🛡️ Ask me about safety, helplines, or how to use SafeHer!",
    sos: "If you're in danger, hold the SOS button for 3 seconds. It alerts your emergency contacts and shares your location instantly.",
    helpline: "Key helplines:\n• Women Helpline: 1091\n• Police: 100\n• Emergency: 112\n• Domestic Violence: 181\n• Cyber Crime: 1930",
    default: "I'm here to help with safety concerns! Ask about helplines, legal rights, SOS features, or safe routes.",
};

function getFallback(msg) {
    const m = msg.toLowerCase();
    if (m.match(/hi|hello|hey/)) return FALLBACK.greet;
    if (m.match(/sos|emergency|danger/)) return FALLBACK.sos;
    if (m.match(/helpline|number|call/)) return FALLBACK.helpline;
    return FALLBACK.default;
}

export default function AISafetyBot() {
    const [open, setOpen] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [msgs, setMsgs] = useState([{
        id: 0, from: 'bot',
        text: "👋 Hi! I'm SafeBot, your AI safety assistant powered by Gemini. Ask me anything about safety, helplines, or legal rights!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const endRef = useRef(null);
    const initializedRef = useRef(false);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

    // Send system prompt on first user message
    const ensureSystemPrompt = async (chatSession) => {
        if (!initializedRef.current) {
            initializedRef.current = true;
            try {
                await chatSession.sendMessage(SYSTEM_PROMPT + '\n\nRespond with just: "Ready" to confirm.');
            } catch (e) {
                console.warn('System prompt failed:', e);
            }
        }
    };

    const send = async () => {
        if (!input.trim()) return;
        const userText = input.trim();
        const userMsg = {
            id: Date.now(), from: 'user', text: userText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMsgs(p => [...p, userMsg]);
        setInput('');
        setTyping(true);

        let reply = '';
        const chatSession = getChat();

        if (chatSession) {
            try {
                await ensureSystemPrompt(chatSession);
                const result = await chatSession.sendMessage(userText);
                reply = result.response.text();
            } catch (err) {
                console.warn('Gemini API error, using fallback:', err);
                reply = getFallback(userText);
            }
        } else {
            // No API key — use fallback
            await new Promise(r => setTimeout(r, 500));
            reply = getFallback(userText);
        }

        setTyping(false);
        setMsgs(p => [...p, {
            id: Date.now() + 1, from: 'bot', text: reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
    };

    const quickPrompts = ['Nearest helplines', 'How to activate SOS?', 'Legal rights', 'Cybercrime help'];

    return (
        <div className="bot-float">
            {/* Chat Window */}
            <AnimatePresence>
                {open && !minimized && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        className="mb-4 w-80 sm:w-96 flex flex-col rounded-2xl overflow-hidden"
                        style={{ height: 460, boxShadow: '0 20px 60px rgba(155,89,182,0.15)', border: '1px solid rgba(155,89,182,0.15)', background: '#FFFFFF' }}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 px-4 py-3" style={{ background: 'linear-gradient(135deg, #9B59B6, #E0457B)', borderBottom: '1px solid rgba(155,89,182,0.2)' }}>
                            <div className="w-9 h-9 rounded-full flex items-center justify-center animate-pulse" style={{ background: 'rgba(255,255,255,0.25)' }}>
                                <Bot size={18} style={{ color: 'white' }} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold font-montserrat" style={{ color: 'white' }}>SafeBot AI <span className="text-xs font-normal opacity-75">· Gemini</span></p>
                                <p className="text-xs flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.85)' }}>
                                    <span className="inline-block rounded-full" style={{ width: 6, height: 6, background: '#27AE60' }} /> Online
                                </p>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => setMinimized(true)} className="p-1.5 rounded-full hover:bg-white/20 transition-colors" style={{ color: 'rgba(255,255,255,0.8)' }}><Minimize2 size={14} /></button>
                                <button onClick={() => setOpen(false)} className="p-1.5 rounded-full hover:bg-white/20 transition-colors" style={{ color: 'rgba(255,255,255,0.8)' }}><X size={14} /></button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ background: '#FAFAFE' }}>
                            {msgs.map(m => (
                                <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line`}
                                        style={m.from === 'user'
                                            ? { background: 'linear-gradient(135deg, #9B59B6, #7B2D8B)', color: 'white', borderBottomRightRadius: 4 }
                                            : { background: '#F3F0F8', color: '#1A1A2E', borderBottomLeftRadius: 4, border: '1px solid rgba(155,89,182,0.1)' }
                                        }>
                                        {m.text}
                                        <div className="text-right mt-0.5 opacity-50" style={{ fontSize: 9 }}>{m.time}</div>
                                    </div>
                                </div>
                            ))}
                            {typing && (
                                <div className="flex justify-start">
                                    <div className="px-4 py-3 rounded-2xl" style={{ background: '#F3F0F8', border: '1px solid rgba(155,89,182,0.1)' }}>
                                        <div className="flex gap-1">
                                            {[0, 1, 2].map(i => (
                                                <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: '#9B59B6', animation: `bounce 1s ${i * 0.15}s infinite` }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={endRef} />
                        </div>

                        {/* Quick Prompts */}
                        <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto" style={{ background: '#FFFFFF' }}>
                            {quickPrompts.map(q => (
                                <button key={q} onClick={() => { setInput(q); }}
                                    className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full transition-all hover:opacity-80"
                                    style={{ background: 'rgba(155,89,182,0.08)', border: '1px solid rgba(155,89,182,0.15)', color: '#9B59B6', fontFamily: 'Montserrat' }}>
                                    {q}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderTop: '1px solid rgba(155,89,182,0.1)', background: '#FFFFFF' }}>
                            <input
                                value={input} onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && send()}
                                placeholder="Ask SafeBot..."
                                className="flex-1 bg-transparent text-sm outline-none px-2"
                                style={{ color: '#1A1A2E' }}
                            />
                            <button onClick={send} disabled={!input.trim() || typing}
                                className="p-2 rounded-full transition-all"
                                style={{ background: input.trim() ? 'linear-gradient(135deg, #9B59B6, #E0457B)' : 'rgba(155,89,182,0.08)', color: 'white' }}>
                                <Send size={15} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle FAB */}
            <motion.button
                onClick={() => { setOpen(!open); setMinimized(false); }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg relative ml-auto"
                style={{ background: 'linear-gradient(135deg, #9B59B6, #E0457B)', boxShadow: '0 0 25px rgba(155,89,182,0.3)' }}
            >
                <AnimatePresence mode="wait">
                    {open && !minimized
                        ? <motion.div key="x" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}><X size={22} color="white" /></motion.div>
                        : <motion.div key="bot" initial={{ rotate: 90 }} animate={{ rotate: 0 }} exit={{ rotate: -90 }}><Bot size={22} color="white" /></motion.div>
                    }
                </AnimatePresence>
                {!open && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center" style={{ fontSize: 9, background: '#E74C3C', fontWeight: 700 }}>AI</span>
                )}
            </motion.button>
        </div>
    );
}
