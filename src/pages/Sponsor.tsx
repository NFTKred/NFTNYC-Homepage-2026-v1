import { useState } from "react";
import SponsorHeader from "@/components/sponsor/SponsorHeader";
import PackageCard from "@/components/sponsor/PackageCard";
import AlaCarteCard from "@/components/sponsor/AlaCarteCard";
import SponsorPartners from "@/components/sponsor/SponsorPartners";
import CommunityPartner from "@/components/sponsor/CommunityPartner";
import TrackTiles from "@/components/sponsor/TrackTiles";
import TrackPackages from "@/components/sponsor/TrackPackages";
import { defaultPackages, defaultAlaCarte } from "@/data/sponsor/packages";

export default function Sponsor() {
  const [filter, setFilter] = useState("all");
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  const filteredPackages =
    filter === "all"
      ? defaultPackages
      : filter === "premium"
      ? defaultPackages.filter((p) => p.tier === "premium")
      : defaultPackages.filter((p) => p.tier === "standard");

  return (
    <div className="min-h-screen bg-background">
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
            <h2 className="text-3xl font-bold text-foreground mb-2">Partnership Packages</h2>
            <p className="text-muted-foreground">Premium sponsorship opportunities with maximum brand visibility</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-secondary rounded-lg p-1 border border-border">
              {[
                { key: "all", label: "All" },
                { key: "premium", label: "Premium" },
                { key: "standard", label: "Standard" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    filter === f.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
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
            <h2 className="text-3xl font-bold text-foreground mb-2">A La Carte Options</h2>
            <p className="text-muted-foreground">Add individual sponsorship elements to customize your presence</p>
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

      {/* Footer */}
      <footer className="relative py-16 text-center">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-teal/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-foreground mb-1 tracking-tight">
            <span>NFT.NYC </span>
            <span className="text-gradient-rainbow">2026</span>
          </h2>
          <p className="text-muted-foreground mb-8">Where Builders, Brands, and Creators Shape the Future of Digital Ownership</p>
          <p className="text-xs text-muted-foreground/50 tracking-wide uppercase">
            Late sponsorship pricing increases apply. Contact us for custom packages.
          </p>
        </div>
      </footer>
    </div>
  );
}
