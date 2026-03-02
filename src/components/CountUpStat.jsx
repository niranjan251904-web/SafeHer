import { useState, useEffect, useRef } from 'react';

export default function CountUpStat({ end, suffix = '', duration = 2000 }) {
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setStarted(true); },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!started) return;
        const start = 0;
        const step = end / (duration / 16);
        let current = start;
        const timer = setInterval(() => {
            current += step;
            if (current >= end) { setCount(end); clearInterval(timer); }
            else setCount(Math.floor(current));
        }, 16);
        return () => clearInterval(timer);
    }, [started, end, duration]);

    const formatNum = (n) => {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
        return n.toLocaleString();
    };

    return (
        <span ref={ref} className="tabular-nums">
            {formatNum(count)}{suffix}
        </span>
    );
}
