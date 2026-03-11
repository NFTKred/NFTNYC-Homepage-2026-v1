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

export default function Countdown({ compact = false }: { compact?: boolean }) {
  const [time, setTime] = useState(calcTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTime(calcTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const units: { label: string; value: number; color: string; delay: string }[] = [
    { label: 'Days', value: time.days, color: '#3B82F6', delay: '0s' },
    { label: 'Hours', value: time.hours, color: '#8B5CF6', delay: '-0.6s' },
    { label: 'Minutes', value: time.minutes, color: '#EC4899', delay: '-1.2s' },
    { label: 'Seconds', value: time.seconds, color: '#10B981', delay: '-1.8s' },
  ];

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        gap: '0.35rem',
        alignItems: 'center',
        fontFamily: "'Space Grotesk', var(--font-body)",
        fontVariantNumeric: 'tabular-nums',
        background: 'var(--color-surface)',
        border: '1px solid var(--card-border)',
        borderRadius: '9999px',
        padding: '0.3rem 0.75rem',
      }}>
        {units.map(({ label, value, color }, i) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{
              fontSize: '13px',
              fontWeight: 700,
              color,
              lineHeight: 1,
            }}>{String(value).padStart(2, '0')}</span>
            <span style={{
              fontSize: '10px',
              fontWeight: 500,
              color: 'var(--color-text-faint)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              lineHeight: 1,
            }}>{label.charAt(0).toLowerCase()}</span>
            {i < units.length - 1 && (
              <span style={{ color: 'var(--color-text-faint)', fontSize: '10px', opacity: 0.4, marginLeft: '0.1rem' }}>·</span>
            )}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3 sm:gap-4 justify-center" style={{ marginTop: '1.5rem', marginBottom: '1.5rem', padding: '0px 15px' }}>
      {units.map(({ label, value, color, delay }) => (
        <div
          key={label}
          className="flex flex-col items-center card-with-glow glow-always rounded-[0.75rem]"
          style={{
            '--glow-c': color,
            '--glow-delay': delay,
            background: 'var(--color-surface)',
            border: '1px solid var(--card-border)',
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
            minWidth: 'clamp(60px, 12vw, 80px)',
          } as React.CSSProperties}
        >
          <div className="card-glow-ring" />
          <div className="card-inner-mask" style={{ background: 'var(--color-surface)' }} />
          <div className="card-content flex flex-col items-center">
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
        </div>
      ))}
    </div>
  );
}
