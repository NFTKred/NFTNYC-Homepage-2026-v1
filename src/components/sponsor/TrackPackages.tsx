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
}

export default function TrackPackages({ trackName }: TrackPackagesProps) {
  const packages = trackPackages[trackName];
  if (!packages) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 pb-16 animate-fade-in">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const config = typeConfig[pkg.type];
          const Icon = config.icon;
          return (
            <div
              key={pkg.type}
              className="flex flex-col rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-brand-teal/30 hover:shadow-[0_0_24px_rgba(20,184,166,0.08)]"
            >
              <div className={`inline-flex items-center gap-1.5 self-start rounded-full border px-3 py-1 text-xs font-medium mb-4 ${config.badgeColor}`}>
                <Icon size={12} />
                {config.label}
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">{pkg.name}</h3>
              <p className="text-2xl font-extrabold text-brand-teal mb-3">{pkg.price}</p>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{pkg.description}</p>
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
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
