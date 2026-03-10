import { EVENT_STATS } from '@/data/nftnyc';

export default function StatsBar() {
  return (
    <section
      style={{
        padding: '2.5rem 1.5rem',
        background: 'var(--color-bg)',
        borderBottom: '1px solid var(--card-border)',
      }}
    >
      <div className="max-w-[960px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
        {EVENT_STATS.map((stat, i) => (
          <div key={stat.label} className="scroll-fade-up">
            <span
              style={{
                fontFamily: "'Space Grotesk', var(--font-body)",
                fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                fontWeight: 700,
                color: 'var(--color-text)',
                display: 'block',
                lineHeight: 1.1,
              }}
            >
              {stat.value}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--color-text-faint)',
                marginTop: '0.35rem',
                display: 'block',
              }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
