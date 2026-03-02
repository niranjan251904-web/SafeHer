import { tickerHelplines } from '../data/helplines';

export default function HelplineTicker() {
    const doubled = [...tickerHelplines, ...tickerHelplines];
    return (
        <div className="relative overflow-hidden py-2.5" style={{
            background: '#FFFFFF',
            borderTop: '1px solid rgba(155,89,182,0.12)',
            borderBottom: '1px solid rgba(155,89,182,0.12)',
        }}>
            <div className="absolute left-0 top-0 bottom-0 w-16 z-10"
                style={{ background: 'linear-gradient(90deg, #FAFAFE, transparent)' }} />
            <div className="absolute right-0 top-0 bottom-0 w-16 z-10"
                style={{ background: 'linear-gradient(-90deg, #FAFAFE, transparent)' }} />
            <div className="ticker-container">
                <div className="ticker-track">
                    {doubled.map((item, i) => (
                        <span key={i} className="flex-shrink-0 text-sm font-montserrat font-medium px-4"
                            style={{ color: '#1A1A2E' }}>
                            {item}
                            <span className="mx-4" style={{ color: '#9B59B6' }}>•</span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
