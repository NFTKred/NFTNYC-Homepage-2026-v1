import { trackPackages, type TrackPackage } from "@/data/sponsor/trackPackages";
import { Mic, MapPin, Ticket, TableProperties, Megaphone, Monitor } from "lucide-react";

const typeConfig: Record<TrackPackage["type"], { label: string; icon: typeof Mic; badgeColor: string }> = {
  track: { label: "Track Sponsorship", icon: Mic, badgeColor: "text-brand-teal border-brand-teal/30 bg-brand-teal/10" },
  timessquare: { label: "Times Square Challenge", icon: MapPin, badgeColor: "text-brand-orange border-brand-orange/30 bg-brand-orange/10" },
  activation: { label: "IRL Activation", icon: Ticket, badgeColor: "text-purple-400 border-purple-400/30 bg-purple-400/10" },
  billboard: { label: "Times Square Billboard", icon: Monitor, badgeColor: "text-amber-400 border-amber-400/30 bg-amber-400/10" },
  demo: { label: "Demo Table", icon: TableProperties, badgeColor: "text-sky-400 border-sky-400/30 bg-sky-400/10" },
  marketing: { label: "Marketing Outreach", icon: Megaphone, badgeColor: "text-pink-400 border-pink-400/30 bg-pink-400/10" },
};

interface TrackPackagesProps {
  trackName: string;
  onSelect?: (pkg: TrackPackage) => void;
}

export default function TrackPackages({ trackName, onSelect }: TrackPackagesProps) {
  const packages = trackPackages[trackName];
  if (!packages) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 pt-2 pb-16 animate-fade-in">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const config = typeConfig[pkg.type];
          const Icon = config.icon;
          return (
            <div
              key={pkg.type}
              className="flex flex-col rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-brand-teal/30 hover:shadow-[0_0_24px_rgba(20,184,166,0.08)]"
            >
              <div className="flex items-start justify-between mb-4 gap-3">
                <div className={`inline-flex items-center gap-1.5 self-start rounded-full border px-3 py-1 text-xs font-medium ${config.badgeColor}`}>
                  <Icon size={12} />
                  {config.label}
                </div>
                {onSelect && (
                  <button
                    onClick={() => onSelect(pkg)}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-brand-teal text-white text-xs font-semibold hover:bg-brand-teal/90 transition-colors whitespace-nowrap"
                  >
                    Select
                  </button>
                )}
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">{pkg.name}</h3>
              <p className="text-2xl font-extrabold text-brand-teal mb-3">{pkg.price}</p>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{pkg.description}</p>

              {/* Ticket boxes — shown when the package has structured ticket counts. */}
              {pkg.tickets && (
                <div className="grid grid-cols-3 gap-3 mb-5">
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

              <div className="mt-auto">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">Includes</p>
                <ul className="space-y-2">
                  {pkg.includes.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-teal shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                {onSelect && (
                  <button
                    onClick={() => onSelect(pkg)}
                    className="w-full mt-4 py-2.5 rounded-lg border border-brand-teal/40 text-brand-teal text-sm font-semibold hover:bg-brand-teal/10 transition-colors"
                  >
                    Select Add-Ons
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
