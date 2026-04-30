import { useState, useMemo } from "react";
import Header from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageMeta from "@/components/PageMeta";
import SponsorHeader from "@/components/sponsor/SponsorHeader";
import PackageCard from "@/components/sponsor/PackageCard";
import AlaCarteCard from "@/components/sponsor/AlaCarteCard";
import SponsorPartners from "@/components/sponsor/SponsorPartners";
import CommunityPartner from "@/components/sponsor/CommunityPartner";
import TrackTiles from "@/components/sponsor/TrackTiles";
import TrackPackages from "@/components/sponsor/TrackPackages";
import PackageInquiryModal, { type BasePackage as InquiryBasePackage } from "@/components/sponsor/PackageInquiryModal";
import PartnershipInquiryModal from "@/components/sponsor/PartnershipInquiryModal";
import PartnershipCTA from "@/components/sponsor/PartnershipCTA";
import { defaultPackages, defaultAlaCarte } from "@/data/sponsor/packages";
import type { Package } from "@/data/sponsor/packages";
import type { TrackPackage } from "@/data/sponsor/trackPackages";

import { Users, Layers, Handshake } from "lucide-react";

const PATHS = [
  {
    id: 'community',
    label: 'Community-Focused Packages',
    icon: Users,
    description: 'Sponsor a specific NFT.NYC track — AI, Gaming, DeFi, Culture, and more. Includes branded stage, speaking slot, activation space, Times Square billboard, and demo table options from $5K–$75K.',
  },
  {
    id: 'packages',
    label: 'Build Your Perfect Package',
    icon: Layers,
    description: 'Choose from premium venue sponsorships (Edison Ballroom, VIP Party, Cafe) and standard expo packages. Then customize with add-ons — Times Square billboards, social media posts, community emails, and more.',
  },
  {
    id: 'partner-program',
    label: 'Community Partner Program',
    icon: Handshake,
    description: 'Enroll for $1,500, sell tickets through your affiliate link, and earn sponsor discounts toward any package. The more you sell, the bigger the package you unlock — up to 50% off.',
  },
];

export default function Sponsor() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark'
  );
  const stage = useMemo(() => Number(localStorage.getItem('nftnyc-stage') ?? 0), []);
  const [filter, setFilter] = useState("all");
  const [selectedTrack, setSelectedTrack] = useState<string | null>('AI Identity Tokenization');
  const [inquiry, setInquiry] = useState<InquiryBasePackage | null>(null);
  const [generalInquiryOpen, setGeneralInquiryOpen] = useState(false);
  const openGeneralInquiry = () => setGeneralInquiryOpen(true);

  const openPackageInquiry = (pkg: Package) => {
    setInquiry({ name: pkg.name, price: pkg.price, tier: pkg.tier, context: 'packages' });
  };
  const openTrackInquiry = (pkg: TrackPackage) => {
    setInquiry({
      name: pkg.name,
      price: pkg.price,
      context: 'community',
      trackName: selectedTrack ?? undefined,
    });
  };

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

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <PageMeta page="sponsor" />
      <Header theme={theme} onToggleTheme={toggleTheme} stage={stage} />

      <SponsorHeader />

      {/* ─── Choose Your Path ─── */}
      <section className="max-w-7xl mx-auto" style={{ padding: '3.5rem 1.5rem 3rem' }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: '#f06347',
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
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
        }}>
          {PATHS.map(path => {
            const Icon = path.icon;
            return (
              <button
                key={path.id}
                onClick={() => scrollTo(path.id)}
                style={{
                  fontFamily: 'var(--font-body)',
                  padding: '1.75rem',
                  borderRadius: '1rem',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#f06347';
                  (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(240,99,71,0.1), rgba(240,99,71,0.03))';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)';
                }}
              >
                <Icon size={28} style={{ color: '#f06347' }} />
                <span style={{
                  fontSize: '17px',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  lineHeight: 1.25,
                }}>{path.label}</span>
                <span style={{
                  fontSize: '13px',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.55,
                }}>{path.description}</span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#f06347',
                }}>View packages ↓</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* CTA #1 — Sits directly below the 'Choose Your Path' tiles so a
          visitor who's surveyed the three top-level paths and doesn't
          see one that fits has an immediate alternative. */}
      <PartnershipCTA
        variant="inline"
        onClick={openGeneralInquiry}
        body="Have something custom in mind? Talk to our partnerships team about a tailored activation."
        ctaLabel="Talk to us →"
      />

      {/* ═══ Section 1: Community-Focused Packages ═══ */}
      <div id="community">
        <TrackTiles selected={selectedTrack} onSelect={(t) => setSelectedTrack(t || null)} />
        {selectedTrack && <TrackPackages trackName={selectedTrack} onSelect={openTrackInquiry} />}

        {/* CTA #2 — Between community-focused tracks and the main packages
            grid: catches sponsors whose industry isn't represented in the
            12 tracks, or who want multi-vertical activations. */}
        <PartnershipCTA
          variant="inline"
          onClick={openGeneralInquiry}
          body="Don't see your industry? We'll build a custom track activation around your goals."
        />

        {/* Partnership Packages — displayed for all communities */}
        <section id="packages" className="relative max-w-7xl mx-auto px-6 pt-10 pb-20">
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: '#f06347',
            textAlign: 'center',
            marginBottom: '2rem',
          }}>More Options</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {defaultPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onSelect={openPackageInquiry}
              />
            ))}
          </div>
        </section>

        {/* CTA #3 — Below the main packages grid: the classic "didn't find
            what you need" placement. Most conversion-friendly slot since
            it catches sponsors who've evaluated everything available. */}
        <PartnershipCTA
          variant="card"
          onClick={openGeneralInquiry}
          eyebrow="Custom Partnerships"
          title="Couldn't find what you were looking for?"
          body="Tell us about your goals and budget. Our partnerships team will design a custom activation tailored to your brand."
        />

        {/* A La Carte Options */}
        <section className="relative max-w-7xl mx-auto px-6 pt-10 pb-20">
          <div className="absolute top-0 inset-x-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-medium tracking-[0.25em] uppercase text-brand-coral mb-3">Add-Ons</p>
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
      </div>

      {/* ═══ Section 3: Community Partner Program ═══ */}
      <div id="partner-program">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
        <CommunityPartner />
      </div>

      {/* CTA #4 — Final closer before the footer / partner logo wall.
          Last chance to convert a scroll-through visitor; pairs the
          "Talk to partnerships" inquiry with a direct Calendly link. */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
      <PartnershipCTA
        variant="hero"
        onClick={openGeneralInquiry}
        eyebrow="Let's talk"
        title="Ready to partner with NFT.NYC 2026?"
        body="Tell us about your goals and we'll design a custom activation tailored to your brand."
      />

      <PackageInquiryModal
        open={!!inquiry}
        onOpenChange={(o) => { if (!o) setInquiry(null); }}
        basePackage={inquiry}
      />
      <PartnershipInquiryModal
        open={generalInquiryOpen}
        onOpenChange={setGeneralInquiryOpen}
      />

      <SponsorPartners />
      <SiteFooter stage={stage} hideIndustryFeed />
    </div>
  );
}
