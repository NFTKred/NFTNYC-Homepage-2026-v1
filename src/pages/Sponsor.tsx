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

export default function Sponsor() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark'
  );
  const stage = useMemo(() => Number(localStorage.getItem('nftnyc-stage') ?? 0), []);
  const [filter, setFilter] = useState("all");
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

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
      <TrackTiles selected={selectedTrack} onSelect={(t) => setSelectedTrack(t || null)} />
      {selectedTrack && <TrackPackages trackName={selectedTrack} />}

      {/* Partnership Packages */}
      <section className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="absolute top-0 inset-x-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-medium tracking-[0.25em] uppercase text-brand-teal mb-2">Sponsorships</p>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Partnership Packages</h2>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Premium sponsorship opportunities with maximum brand visibility</p>
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
      <section className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="absolute top-0 inset-x-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-medium tracking-[0.25em] uppercase text-brand-teal mb-2">Add-Ons</p>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>A La Carte Options</h2>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Add individual sponsorship elements to customize your presence</p>
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

      {/* Community Partner Program */}
      <CommunityPartner />

      <SiteFooter stage={stage} />
    </div>
  );
}
