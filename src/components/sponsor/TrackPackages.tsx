import { useState } from "react";
import { trackPackages, type TrackPackage } from "@/data/sponsor/trackPackages";
import { Mic, MapPin, Ticket, TableProperties, Megaphone, Monitor } from "lucide-react";

const typeConfig: Record<TrackPackage["type"], { label: string; icon: typeof Mic; badgeColor: string }> = {
  track: { label: "Track Sponsorship", icon: Mic, badgeColor: "text-brand-coral border-brand-coral/30 bg-brand-coral/10" },
  timessquare: { label: "Times Square Challenge", icon: MapPin, badgeColor: "text-brand-orange border-brand-orange/30 bg-brand-orange/10" },
  activation: { label: "IRL Activation", icon: Ticket, badgeColor: "text-purple-400 border-purple-400/30 bg-purple-400/10" },
  billboard: { label: "Times Square Billboard", icon: Monitor, badgeColor: "text-amber-400 border-amber-400/30 bg-amber-400/10" },
  demo: { label: "Demo Table", icon: TableProperties, badgeColor: "text-sky-400 border-sky-400/30 bg-sky-400/10" },
  marketing: { label: "Marketing Outreach", icon: Megaphone, badgeColor: "text-pink-400 border-pink-400/30 bg-pink-400/10" },
};

// Derived summary fields per package type — mirrors the billboard/speaking/expo
// layout in PackageCard. These are generic across all tracks.
const typeSummary: Record<TrackPackage["type"], { billboard: string; speaking: string; expoSpace: string }> = {
  track:       { billboard: "—", speaking: "15 min Keynote", expoSpace: "—" },
  timessquare: { billboard: "—", speaking: "10 min Talk", expoSpace: "—" },
  activation:  { billboard: "—", speaking: "5 min Talk", expoSpace: "20' x 20'" },
  billboard:   { billboard: "15 sec Times Square video", speaking: "—", expoSpace: "—" },
  demo:        { billboard: "—", speaking: "—", expoSpace: "10' x 10'" },
  marketing:   { billboard: "—", speaking: "—", expoSpace: "—" },
};

interface TrackPackagesProps {
  trackName: string;
  onSelect?: (pkg: TrackPackage) => void;
}

function TrackCard({ pkg, onSelect }: { pkg: TrackPackage; onSelect?: (pkg: TrackPackage) => void }) {
  const [expanded, setExpanded] = useState(false);
  const config = typeConfig[pkg.type];
  const summary = typeSummary[pkg.type];
  const Icon = config.icon;

  // Check if there's anything meaningful to show in the summary row
  const hasSummary = summary.billboard !== "—" || summary.speaking !== "—" || summary.expoSpace !== "—";

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-brand-coral/30 hover:shadow-[0_0_24px_rgba(240,99,71,0.08)]">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className={`inline-flex items-center gap-1.5 self-start rounded-full border px-3 py-1 text-xs font-medium ${config.badgeColor}`}>
          <Icon size={12} />
          {config.label}
        </div>
        {onSelect && (
          <button
            onClick={() => onSelect(pkg)}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-brand-coral text-white text-xs font-semibold hover:bg-brand-coral/90 transition-colors whitespace-nowrap"
          >
            Select
          </button>
        )}
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">{pkg.name}</h3>
      <p className="text-2xl font-extrabold text-brand-coral mb-3">{pkg.price}</p>
      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{pkg.description}</p>

      {/* Ticket boxes */}
      {pkg.tickets && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "VIP", count: pkg.tickets.vip },
            { label: "GA", count: pkg.tickets.ga },
            { label: "Staff", count: pkg.tickets.staff ?? 0 },
          ].map(t => (
            <div key={t.label} className="bg-secondary rounded-lg p-3 text-center">
              <div className={`text-xs mb-1 ${t.count ? 'text-muted-foreground' : 'text-muted-foreground/25'}`}>{t.label}</div>
              <div className={`text-lg font-bold ${t.count ? 'text-foreground' : 'text-foreground/20'}`}>{t.count}</div>
            </div>
          ))}
        </div>
      )}

      {/* Billboard / Speaking / Expo Space summary */}
      {hasSummary && (
        <div className="space-y-2 mb-4">
          {summary.billboard !== "—" && (
            <div className="flex items-start gap-2 text-sm">
              <span className="text-muted-foreground shrink-0 w-[5.5rem]">Billboard:</span>
              <span className="text-muted-foreground/80">{summary.billboard}</span>
            </div>
          )}
          {summary.speaking !== "—" && (
            <div className="flex items-start gap-2 text-sm">
              <span className="text-muted-foreground shrink-0 w-[5.5rem]">Speaking:</span>
              <span className="text-muted-foreground/80">{summary.speaking}</span>
            </div>
          )}
          {summary.expoSpace !== "—" && (
            <div className="flex items-start gap-2 text-sm">
              <span className="text-muted-foreground shrink-0 w-[5.5rem]">Expo Space:</span>
              <span className="text-muted-foreground/80">{summary.expoSpace}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-auto">
        {/* Package Details accordion */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-sm text-brand-coral hover:text-brand-coral/80 font-medium flex items-center justify-center gap-1 py-2 rounded-lg hover:bg-brand-coral/5 transition-colors"
        >
          {expanded ? "Hide" : "Show"} Package Details
          <svg className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expanded && (
          <ul className="mt-3 space-y-2 border-t border-border pt-3">
            {pkg.includes.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-coral shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        )}

        {onSelect && (
          <button
            onClick={() => onSelect(pkg)}
            className="w-full mt-4 py-2.5 rounded-lg border border-brand-coral/40 text-brand-coral text-sm font-semibold hover:bg-brand-coral/10 transition-colors"
          >
            Select Add-Ons
          </button>
        )}
      </div>
    </div>
  );
}

export default function TrackPackages({ trackName, onSelect }: TrackPackagesProps) {
  const packages = trackPackages[trackName];
  if (!packages) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 pt-2 pb-16 animate-fade-in">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <TrackCard key={pkg.type} pkg={pkg} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
