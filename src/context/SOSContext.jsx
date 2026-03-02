import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { sendSMSLink, sendEmailAlerts } from '../services/sosAlertService';

const SOSContext = createContext(null);

const MOCK_CONTACTS = [
    { name: 'Mom', phone: '+91-9876543210', relation: 'Family' },
    { name: 'Riya (Best Friend)', phone: '+91-9876000001', relation: 'Friend' },
    { name: 'Arjun (Brother)', phone: '+91-9876000002', relation: 'Family' },
];

export function SOSProvider({ children }) {
    const { user } = useAuth();
    const [sosActive, setSosActive] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [alertLog, setAlertLog] = useState([]);
    const [location, setLocation] = useState({ lat: 28.6139, lng: 77.2090, city: 'New Delhi' });
    const [holdProgress, setHoldProgress] = useState(0);
    const [contacts, setContacts] = useState(MOCK_CONTACTS);
    const holdTimer = useRef(null);
    const countdownTimer = useRef(null);
    const holdInterval = useRef(null);

    // Load emergency contacts from Firestore when user is logged in
    useEffect(() => {
        if (!user?.uid) {
            setContacts([]);
            return;
        }
        const loadContacts = async () => {
            try {
                const snap = await getDocs(collection(db, 'users', user.uid, 'contacts'));
                if (!snap.empty) {
                    setContacts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                } else {
                    setContacts([]);
                }
            } catch (e) {
                console.warn('Could not load contacts from Firestore:', e);
                setContacts([]);
            }
        };
        loadContacts();
    }, [user?.uid]);

    // Fetch GPS location on mount
    useEffect(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                let city = 'Your Location';
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12`);
                    const data = await res.json();
                    city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Your Location';
                } catch (e) {
                    console.warn('Reverse geocode failed:', e);
                }
                setLocation({ lat, lng, city });
            },
            (err) => {
                console.warn('Geolocation permission denied or unavailable:', err);
            },
            { enableHighAccuracy: true, timeout: 10000 },
        );
    }, []);

    const addLog = useCallback((msg, type = 'info') => {
        setAlertLog(prev => [
            { id: Date.now(), msg, type, time: new Date().toLocaleTimeString() },
            ...prev,
        ].slice(0, 20));
    }, []);

    const activateSOS = useCallback(async () => {
        if (sosActive) return;
        setSosActive(true);
        addLog('🚨 SOS ACTIVATED — Broadcasting emergency!', 'sos');

        // Get real location if available
        let currentLocation = location;
        try {
            const pos = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });
            currentLocation = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                city: location.city, // Keep existing city name
            };
            setLocation(currentLocation);
        } catch (e) {
            console.warn('Could not get GPS location, using default:', e);
        }

        // Write SOS alert to Firestore
        if (user?.uid) {
            try {
                await addDoc(collection(db, 'sosAlerts'), {
                    userId: user.uid,
                    location: { lat: currentLocation.lat, lng: currentLocation.lng, city: currentLocation.city },
                    timestamp: new Date().toISOString(),
                    status: 'Active',
                });
                addLog('☁️ Alert saved to cloud', 'info');
            } catch (e) {
                console.warn('Could not save SOS alert to Firestore:', e);
            }
        }

        // 1. Open SMS app with pre-filled SOS message
        const userName = user?.name || 'A SafeHer User';
        const smsResult = sendSMSLink(contacts, currentLocation, userName);
        if (smsResult.success) {
            addLog(`📱 SMS app opened for ${smsResult.count} contact(s)`, 'contact');
        }

        // 2. Send email alerts via EmailJS
        const emailResult = await sendEmailAlerts(contacts, currentLocation, {
            name: userName,
            email: user?.email || '',
        });
        if (emailResult.success) {
            addLog(`📧 Email alerts sent to ${emailResult.sent} contact(s)`, 'success');
        } else if (emailResult.reason === 'EmailJS not configured') {
            addLog('📧 Email alerts skipped (not configured)', 'info');
        } else if (emailResult.reason) {
            addLog(`📧 ${emailResult.reason}`, 'info');
        }

        // Alert sequence (visual feedback)
        const contactList = contacts;
        const sequence = [
            { delay: 500, msg: '📍 Location acquired: ' + currentLocation.city, type: 'location' },
            ...contactList.map((c, i) => ({
                delay: 1200 + i * 800,
                msg: `📲 Notified ${c.name} (${c.phone})${c.email ? ' + email' : ''}`,
                type: 'contact',
            })),
            { delay: 1200 + contactList.length * 800 + 500, msg: '🚓 Police emergency alert sent to nearest station', type: 'police' },
            { delay: 1200 + contactList.length * 800 + 1500, msg: '📡 Live location sharing activated', type: 'info' },
            { delay: 1200 + contactList.length * 800 + 2500, msg: '🛡️ SafeHer monitoring team alerted', type: 'info' },
        ];

        sequence.forEach(({ delay, msg, type }) => {
            setTimeout(() => addLog(msg, type), delay);
        });
    }, [sosActive, location, contacts, addLog, user?.uid, user?.name, user?.email]);

    const deactivateSOS = useCallback(() => {
        setSosActive(false);
        setCountdown(0);
        setHoldProgress(0);
        addLog('✅ SOS deactivated. You are safe.', 'success');
    }, [addLog]);

    const startHold = useCallback(() => {
        if (sosActive) return;
        let progress = 0;
        holdInterval.current = setInterval(() => {
            progress += 3.33;
            setHoldProgress(Math.min(progress, 100));
            if (progress >= 100) {
                clearInterval(holdInterval.current);
                activateSOS();
            }
        }, 100);
    }, [sosActive, activateSOS]);

    const cancelHold = useCallback(() => {
        if (sosActive) return;
        clearInterval(holdInterval.current);
        setHoldProgress(0);
    }, [sosActive]);

    return (
        <SOSContext.Provider value={{
            sosActive, countdown, alertLog, location, holdProgress,
            activateSOS, deactivateSOS, startHold, cancelHold,
            contacts, setContacts, addLog,
        }}>
            {children}
        </SOSContext.Provider>
    );
}

export const useSOS = () => useContext(SOSContext);
