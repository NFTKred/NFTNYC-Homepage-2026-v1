import { useState, useMemo } from "react";
import Header from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SponsorHeader from "@/components/sponsor/SponsorHeader";
import PackageCard from "@/components/sponsor/PackageCard";
import AlaCarteCard from "@/components/sponsor/AlaCarteCard";
import SponsorPartners from "@/components/sponsor/SponsorPartners";
import CommunityPartner from "@/components/sponsor/CommunityPartner";
import TrackTiles from "@/components/sponsor/TrackTiles";
import TrackPackages from "@/components/sponsor/TrackPackages";
import { defaultPackages, defaultAlaCarte } from "@/data/sponsor/packages";

type PartnerTab = 'community' | 'packages' | 'partner-program';

const TABS: { key: PartnerTab; label: string; description: string }[] = [
  { key: 'community', label: 'Sponsorship by Community', description: 'Target the specific segment of the NFT.NYC community that aligns with your brand' },
  { key: 'packages', label: 'Browse Partnership Packages', description: 'Premium sponsorship opportunities with maximum brand visibility' },
  { key: 'partner-program', label: 'Community Partner Program', description: 'Earn your way in — sell tickets, earn credits, unlock sponsorship benefits' },
];

export default function Sponsor() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark'
  );
  const stage = useMemo(() => Number(localStorage.getItem('nftnyc-stage') ?? 0), []);
  const [activeTab, setActiveTab] = useState<PartnerTab>('community');
  const [filter, setFilter] = useState("all");
  const [selectedTrack, setSelectedTrack] = useState<string | null>('AI Identity Tokenization');

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const filteredPackages =
    filter === "all"
      ? defaultPackages
      : filter === "premium"
      ? defaultPackages.filter((p) => p.tier === "premium")
      : defaultPackages.filter((p) => p.tier === "standard");

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <Header theme={theme} onToggleTheme={toggleTheme} stage={stage} />

      <SponsorHeader />
      <SponsorPartners />

      {/* ─── Tab Selector ─── */}
      <section style={{ padding: '3.5rem 1.5rem 0', maxWidth: '1200px', margin: '0 auto' }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: '#14b8a6',
          textAlign: 'center',
          marginBottom: '0.75rem',
        }}>How Would You Like to Partner?</p>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(24px, 3vw, 32px)',
          fontWeight: 700,
          color: 'var(--color-text)',
          textAlign: 'center',
          marginBottom: '2rem',
          textTransform: 'uppercase',
        }}>Choose Your Path</h2>

        <div style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '15px',
                  fontWeight: 600,
                  padding: '0.875rem 1.75rem',
                  borderRadius: '0.75rem',
                  border: isActive ? '1px solid #14b8a6' : '1px solid var(--color-border)',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(20,184,166,0.05))'
                    : 'var(--color-surface)',
                  color: isActive ? '#14b8a6' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-text-faint)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--color-text)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
                  }
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── Tab Content ─── */}

      {activeTab === 'community' && (
        <>
          <TrackTiles selected={selectedTrack} onSelect={(t) => setSelectedTrack(t || null)} />
          {selectedTrack && <TrackPackages trackName={selectedTrack} />}
        </>
      )}

      {activeTab === 'packages' && (
        <>
          {/* Partnership Packages */}
          <section className="relative max-w-7xl mx-auto px-6 pt-10 pb-20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
              <div>
                <p className="text-xs font-medium tracking-[0.25em] uppercase text-brand-teal mb-3">Sponsorships</p>
                <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Partnership Packages</h2>
                <p style={{ color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>Premium sponsorship opportunities with maximum brand visibility</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex rounded-lg p-1 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                  {[
                    { key: "all", label: "All" },
                    { key: "premium", label: "Premium" },
                    { key: "standard", label: "Standard" },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      style={{
                        padding: '0.375rem 1rem',
                        borderRadius: '0.375rem',
                        fontSize: '14px',
                        fontFamily: 'var(--font-body)',
                        fontWeight: 500,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 180ms ease',
                        background: filter === f.key ? '#14b8a6' : 'transparent',
                        color: filter === f.key ? '#fff' : 'var(--color-text-muted)',
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ))}
            </div>
          </section>

          {/* A La Carte Options */}
          <section className="relative max-w-7xl mx-auto px-6 pt-10 pb-20">
            <div className="absolute top-0 inset-x-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
              <div>
                <p className="text-xs font-medium tracking-[0.25em] uppercase text-brand-teal mb-3">Add-Ons</p>
                <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>A La Carte Options</h2>
                <p style={{ color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>Add individual sponsorship elements to customize your presence</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {defaultAlaCarte.map((item) => (
                <AlaCarteCard
                  key={item.id}
                  item={item}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {activeTab === 'partner-program' && (
        <CommunityPartner />
      )}

      <SiteFooter stage={stage} />
    </div>
  );
}
