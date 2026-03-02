import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Heart, MessageCircle, Search, Filter, Flag, Plus, ThumbsUp, X } from 'lucide-react';
import { collection, addDoc, updateDoc, doc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { categories } from '../data/forumPosts';

export default function ForumPage() {
    const { user, openAuth } = useAuth();
    const [activeCategory, setActiveCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [likes, setLikes] = useState({});
    const [expandedPost, setExpandedPost] = useState(null);
    const [posts, setPosts] = useState([]);
    const [showNewPost, setShowNewPost] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'tips', tags: '' });
    const [submitting, setSubmitting] = useState(false);

    // Real-time Firestore listener for forum posts
    useEffect(() => {
        const q = query(collection(db, 'forumPosts'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const firestorePosts = snapshot.docs.map(d => {
                const data = d.data();
                return {
                    id: d.id,
                    author: data.author || 'Anonymous',
                    avatar: data.avatar || 'A',
                    avatarColor: data.avatarColor || '#9B59B6',
                    title: data.title || '',
                    content: data.content || '',
                    category: data.category || 'tips',
                    timestamp: formatTimestamp(data.createdAt),
                    likes: data.likes || 0,
                    comments: data.comments || 0,
                    tags: data.tags || [],
                    verified: data.verified || false,
                    location: data.location || '',
                };
            });
            setPosts(firestorePosts);
        }, (err) => {
            console.warn('Firestore listener error:', err);
        });
        return unsubscribe;
    }, []);

    const filtered = posts.filter(p => {
        const matchCat = activeCategory === 'all' || p.category === activeCategory;
        const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.content.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    const toggleLike = async (id) => {
        const isLiked = likes[id];
        setLikes(prev => ({ ...prev, [id]: !prev[id] }));
        // Update like count in Firestore
        if (typeof id === 'string') {
            try {
                const post = posts.find(p => p.id === id);
                if (post) {
                    await updateDoc(doc(db, 'forumPosts', id), {
                        likes: (post.likes || 0) + (isLiked ? -1 : 1),
                    });
                }
            } catch (e) {
                console.warn('Could not update like:', e);
            }
        }
    };

    const handleNewPost = async (e) => {
        e.preventDefault();
        if (!user) { openAuth('login'); return; }
        if (!newPost.title.trim() || !newPost.content.trim()) return;
        setSubmitting(true);
        try {
            const authorName = user.name || user.email || 'Anonymous';
            const authorAvatar = user.avatar || authorName.slice(0, 2).toUpperCase();
            await addDoc(collection(db, 'forumPosts'), {
                title: newPost.title.trim(),
                content: newPost.content.trim(),
                category: newPost.category,
                tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean),
                author: authorName,
                authorId: user.uid,
                avatar: authorAvatar,
                avatarColor: '#9B59B6',
                likes: 0,
                comments: 0,
                verified: false,
                location: '',
                createdAt: serverTimestamp(),
            });
            setNewPost({ title: '', content: '', category: 'tips', tags: '' });
            setShowNewPost(false);
        } catch (e) {
            console.warn('Could not create post:', e);
        }
        setSubmitting(false);
    };

    return (
        <div className="min-h-screen pt-20" style={{ background: 'var(--bg)' }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 pb-24">
                {/* Header */}
                <div className="text-center mb-10">
                    <span className="section-label"><Users size={13} /> Community</span>
                    <h1 className="font-playfair font-black text-4xl sm:text-5xl mt-2 mb-3" style={{ color: 'var(--text)' }}>
                        You Are <span className="gradient-text">Not Alone</span>
                    </h1>
                    <p className="text-base max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
                        Share your story, read experiences, find support — a community that lifts every woman up.
                    </p>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                        <input type="text" placeholder="Search posts..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                            style={{ background: 'rgba(155,89,182,0.04)', border: '1px solid rgba(155,89,182,0.2)', color: 'var(--text)' }} />
                    </div>
                    <button onClick={() => user ? setShowNewPost(true) : openAuth('login')}
                        className="btn-primary flex items-center gap-2 py-2.5 px-5 text-sm">
                        <Plus size={15} /> Share Story
                    </button>
                </div>

                {/* New Post Modal */}
                <AnimatePresence>
                    {showNewPost && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
                            onClick={e => e.target === e.currentTarget && setShowNewPost(false)}>
                            <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
                                className="glass rounded-2xl p-7 w-full max-w-lg" style={{ border: '1px solid rgba(155,89,182,0.3)' }}>
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="font-montserrat font-bold text-lg" style={{ color: 'var(--text)' }}>Share Your Story</h3>
                                    <button onClick={() => setShowNewPost(false)} className="p-2 rounded-full hover:bg-white/10" style={{ color: 'var(--text-muted)' }}>
                                        <X size={18} />
                                    </button>
                                </div>
                                <form onSubmit={handleNewPost} className="space-y-4">
                                    <input type="text" value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
                                        placeholder="Post title" required
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                        style={{ background: 'rgba(155,89,182,0.04)', border: '1px solid rgba(155,89,182,0.2)', color: 'var(--text)' }} />
                                    <textarea value={newPost.content} onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                                        placeholder="Share your experience..." required rows={4}
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                                        style={{ background: 'rgba(155,89,182,0.04)', border: '1px solid rgba(155,89,182,0.2)', color: 'var(--text)' }} />
                                    <div className="flex flex-wrap gap-2">
                                        {categories.filter(c => c.id !== 'all').map(cat => (
                                            <button type="button" key={cat.id} onClick={() => setNewPost(p => ({ ...p, category: cat.id }))}
                                                className="px-3 py-1.5 rounded-full text-xs font-montserrat font-semibold transition-all"
                                                style={{
                                                    background: newPost.category === cat.id ? 'rgba(155,89,182,0.2)' : 'rgba(155,89,182,0.04)',
                                                    border: `1px solid ${newPost.category === cat.id ? 'rgba(155,89,182,0.4)' : 'rgba(155,89,182,0.12)'}`,
                                                    color: newPost.category === cat.id ? '#9B59B6' : 'var(--text-muted)',
                                                }}>
                                                {cat.icon} {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                    <input type="text" value={newPost.tags} onChange={e => setNewPost(p => ({ ...p, tags: e.target.value }))}
                                        placeholder="Tags (comma separated)"
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                        style={{ background: 'rgba(155,89,182,0.04)', border: '1px solid rgba(155,89,182,0.2)', color: 'var(--text)' }} />
                                    <button type="submit" disabled={submitting}
                                        className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
                                        style={{ background: 'linear-gradient(135deg, #9B59B6, #E0457B)', color: 'white', opacity: submitting ? 0.7 : 1 }}>
                                        {submitting ? 'Posting...' : 'Publish Story'}
                                    </button>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-7">
                    {categories.map(cat => (
                        <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-montserrat font-semibold transition-all"
                            style={{
                                background: activeCategory === cat.id ? 'rgba(155,89,182,0.2)' : 'rgba(155,89,182,0.04)',
                                border: `1px solid ${activeCategory === cat.id ? 'rgba(155,89,182,0.4)' : 'rgba(155,89,182,0.12)'}`,
                                color: activeCategory === cat.id ? '#9B59B6' : 'var(--text-muted)',
                            }}>
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                </div>

                {/* Posts */}
                <div className="space-y-5">
                    <AnimatePresence>
                        {filtered.map((post, i) => (
                            <motion.div key={post.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                                className="glass rounded-2xl overflow-hidden card-hover">
                                <div className="p-6">
                                    {/* Author */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                                            style={{ background: `radial-gradient(circle, ${post.avatarColor}, #F3F0F8)`, border: `2px solid ${post.avatarColor}40` }}>
                                            {post.avatar}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-montserrat font-bold text-sm" style={{ color: 'var(--text)' }}>{post.author}</span>
                                                {post.verified && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(39,174,96,0.12)', color: '#27AE60', border: '1px solid rgba(39,174,96,0.2)' }}>✓ Verified</span>}
                                            </div>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{post.location} · {post.timestamp}</p>
                                        </div>
                                        <button className="p-1.5 rounded-full hover:bg-white/5 transition-colors" style={{ color: 'var(--text-muted)' }}>
                                            <Flag size={14} />
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <h2 className="font-montserrat font-bold text-base mb-3" style={{ color: 'var(--text)' }}>{post.title}</h2>
                                    <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
                                        {expandedPost === post.id ? post.content : post.content.slice(0, 160) + (post.content.length > 160 ? '...' : '')}
                                    </p>
                                    {post.content.length > 160 && (
                                        <button onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                                            className="text-xs font-semibold font-montserrat mb-3" style={{ color: '#9B59B6' }}>
                                            {expandedPost === post.id ? 'Show less' : 'Read more'}
                                        </button>
                                    )}

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {post.tags.map(tag => (
                                            <span key={tag} className="text-xs px-2 py-0.5 rounded-full"
                                                style={{ background: 'rgba(155,89,182,0.1)', color: '#9B59B6', border: '1px solid rgba(155,89,182,0.15)' }}>
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-4 pt-3" style={{ borderTop: '1px solid rgba(155,89,182,0.1)' }}>
                                        <button onClick={() => toggleLike(post.id)}
                                            className="flex items-center gap-1.5 text-sm transition-all"
                                            style={{ color: likes[post.id] ? '#FF6B9D' : 'var(--text-muted)' }}>
                                            <Heart size={15} fill={likes[post.id] ? '#FF6B9D' : 'none'} />
                                            {post.likes}
                                        </button>
                                        <button className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                                            <MessageCircle size={15} /> {post.comments}
                                        </button>
                                        <div className="flex-1" />
                                        <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                                            style={{ background: 'rgba(155,89,182,0.04)', color: 'var(--text-muted)' }}>
                                            {post.category}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {filtered.length === 0 && (
                        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
                            <Users size={40} className="mx-auto mb-3 opacity-30" />
                            <p>No posts found. Try a different search.</p>
                        </div>
                    )}
                </div>

                {/* Community values */}
                <div className="mt-12 p-6 rounded-2xl text-center" style={{ background: 'rgba(155,89,182,0.06)', border: '1px solid rgba(155,89,182,0.15)' }}>
                    <p className="font-playfair text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>Community Guidelines</p>
                    <p className="text-sm max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
                        This is a safe space. Be kind, be supportive 💜 — do not share identifying information about others. All posts are anonymized by default.
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ── Helper ── */
function formatTimestamp(ts) {
    if (!ts) return 'Just now';
    // Handle Firestore Timestamp objects and ISO strings
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
}
