import { useEffect, useState } from 'react';

const TARGET = new Date('2026-09-01T09:00:00-04:00').getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(): TimeLeft {
  const diff = Math.max(0, TARGET - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function Countdown() {
  const [time, setTime] = useState(calcTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTime(calcTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const units: { label: string; value: number }[] = [
    { label: 'Days', value: time.days },
    { label: 'Hours', value: time.hours },
    { label: 'Minutes', value: time.minutes },
    { label: 'Seconds', value: time.seconds },
  ];

  return (
    <div className="flex gap-3 sm:gap-4 justify-center" style={{ marginTop: '1.5rem' }}>
      {units.map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-col items-center"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
            minWidth: 'clamp(60px, 12vw, 80px)',
          }}
        >
          <span
            style={{
              fontFamily: "'Space Grotesk', var(--font-body)",
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
              fontWeight: 700,
              lineHeight: 1,
              color: 'var(--color-text)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {String(value).padStart(2, '0')}
          </span>
          <span
            style={{
              fontFamily: "'Space Grotesk', var(--font-body)",
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--color-text-faint)',
              marginTop: '0.4rem',
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
