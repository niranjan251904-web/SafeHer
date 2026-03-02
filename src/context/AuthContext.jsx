import { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState('login'); // 'login' | 'signup'

    // Listen for Firebase auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Build user object from Firebase + Firestore
                let profileData = {};
                try {
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const snap = await getDoc(userDocRef);
                    if (snap.exists()) {
                        profileData = snap.data();
                    } else {
                        // Auto-create Firestore profile if it doesn't exist yet
                        const newProfile = {
                            name: firebaseUser.displayName || 'User',
                            email: firebaseUser.email,
                            avatar: (firebaseUser.displayName || 'U').slice(0, 2).toUpperCase(),
                            createdAt: new Date().toISOString(),
                            settings: {
                                share_location: true,
                                fake_call: true,
                                area_alerts: false,
                                community_notify: false,
                                nightly_checkin: true,
                            },
                        };
                        await setDoc(userDocRef, newProfile);
                        profileData = newProfile;
                        console.log('✅ Created Firestore profile for user:', firebaseUser.uid);
                    }
                } catch (e) {
                    console.warn('Could not fetch/create Firestore profile:', e);
                }
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    name: profileData.name || firebaseUser.displayName || 'User',
                    avatar: profileData.avatar || (firebaseUser.displayName || 'U').slice(0, 2).toUpperCase(),
                    ...profileData,
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setIsOpen(false);
            return { success: true };
        } catch (err) {
            return { success: false, error: firebaseErrorMessage(err.code) };
        }
    };

    const signup = async (name, email, password) => {
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(cred.user, { displayName: name });
            // Create Firestore user document (non-blocking — don't fail signup if Firestore is down)
            const avatar = name.slice(0, 2).toUpperCase();
            try {
                await setDoc(doc(db, 'users', cred.user.uid), {
                    name,
                    email,
                    avatar,
                    createdAt: new Date().toISOString(),
                    settings: {
                        share_location: true,
                        fake_call: true,
                        area_alerts: false,
                        community_notify: false,
                        nightly_checkin: true,
                    },
                });
            } catch (firestoreErr) {
                console.warn('⚠️ Could not save user profile to Firestore:', firestoreErr.message);
                console.warn('Make sure Firestore database is created and security rules allow writes.');
            }
            setIsOpen(false);
            return { success: true };
        } catch (err) {
            return { success: false, error: firebaseErrorMessage(err.code) };
        }
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
    };

    const openAuth = (m = 'login') => { setMode(m); setIsOpen(true); };
    const closeAuth = () => setIsOpen(false);

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, isOpen, openAuth, closeAuth, mode, setMode }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

/* ── Helper: human-friendly Firebase error messages ── */
function firebaseErrorMessage(code) {
    switch (code) {
        case 'auth/email-already-in-use': return 'This email is already registered. Try signing in.';
        case 'auth/invalid-email': return 'Please enter a valid email address.';
        case 'auth/user-not-found': return 'No account found with this email.';
        case 'auth/wrong-password': return 'Incorrect password. Please try again.';
        case 'auth/weak-password': return 'Password should be at least 6 characters.';
        case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
        case 'auth/invalid-credential': return 'Invalid email or password. Please try again.';
        default: return 'Something went wrong. Please try again.';
    }
}
