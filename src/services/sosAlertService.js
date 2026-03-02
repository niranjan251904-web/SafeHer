import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * Build the SOS emergency message text
 */
function buildSOSMessage(userName, location) {
    const mapLink = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    const time = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    return {
        text: `🚨 EMERGENCY SOS from SafeHer!\n\n${userName} has triggered an SOS emergency alert!\n\n📍 Location: ${location.city}\n🗺️ Map: ${mapLink}\n🕐 Time: ${time}\n\nPlease respond immediately or call emergency services.`,
        mapLink,
        time,
    };
}

/**
 * Open native SMS app with pre-filled SOS message to all contacts
 */
export function sendSMSLink(contacts, location, userName) {
    const { text } = buildSOSMessage(userName, location);
    // Collect all phone numbers
    const phones = contacts
        .map(c => c.phone?.replace(/[\s\-()]/g, ''))
        .filter(Boolean);

    if (phones.length === 0) return { success: false, reason: 'No phone numbers' };

    // sms: URI — comma-separated numbers + body
    const smsUri = `sms:${phones.join(',')}?body=${encodeURIComponent(text)}`;
    window.open(smsUri, '_blank');

    return { success: true, count: phones.length };
}

/**
 * Send SOS email alerts via EmailJS to all contacts with email addresses
 */
export async function sendEmailAlerts(contacts, location, user) {
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
        console.warn('EmailJS not configured — skipping email alerts');
        return { success: false, reason: 'EmailJS not configured', sent: 0 };
    }

    const { mapLink, time } = buildSOSMessage(user.name, location);
    const emailContacts = contacts.filter(c => c.email && c.email.trim());

    if (emailContacts.length === 0) {
        return { success: false, reason: 'No contacts have email addresses', sent: 0 };
    }

    let sent = 0;
    const errors = [];

    for (const contact of emailContacts) {
        try {
            await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
                email: contact.email,
                contact_name: contact.name,
                user_name: user.name || 'A SafeHer User',
                user_email: user.email || '',
                location: location.city || 'Unknown',
                map_link: mapLink,
                time: time,
            }, PUBLIC_KEY);
            sent++;
        } catch (err) {
            console.warn(`Failed to email ${contact.name}:`, err);
            errors.push(contact.name);
        }
    }

    return {
        success: sent > 0,
        sent,
        total: emailContacts.length,
        errors,
    };
}
