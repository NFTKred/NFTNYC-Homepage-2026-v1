import { useState } from "react";
import type { Package } from "@/data/packages";

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "soldOut" | "premium" }) {
  const styles = {
    default: "bg-primary/10 text-primary border-primary/30",
    soldOut: "bg-red-900/30 text-red-400 border-red-500/30",
    premium: "bg-brand-orange/15 text-brand-orange border-brand-orange/30",
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}>
      {children}
    </span>
  );
}

interface PackageCardProps {
  pkg: Package;
  onEdit?: (pkg: Package) => void;
  onDelete?: (id: number | null) => void;
  onSelect?: (pkg: Package) => void;
}

export default function PackageCard({ pkg, onSelect }: PackageCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isSoldOut = pkg.availability === "Sold Out";

  return (
    <div className={`group relative bg-card border rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/40 flex flex-col ${isSoldOut ? "border-red-500/20 opacity-75" : "border-border"}`}>
      {pkg.image && (
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={pkg.image}
            alt={pkg.name}
            className="w-full h-full object-cover"
            style={{ objectPosition: pkg.imagePosition ?? 'center' }}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3 gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant={isSoldOut ? "soldOut" : "default"}>
                {pkg.availability}
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-foreground">{pkg.name}</h3>
          </div>
          {onSelect && !isSoldOut && (
            <button
              onClick={() => onSelect(pkg)}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-brand-teal text-white text-xs font-semibold hover:bg-brand-teal/90 transition-colors whitespace-nowrap"
            >
              Select
            </button>
          )}
        </div>

        <p className="text-2xl font-bold text-brand-orange mb-3">{pkg.price}</p>
        <p className="text-muted-foreground text-sm mb-4">{pkg.description}</p>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "VIP", count: pkg.tickets.vip },
            { label: "GA", count: pkg.tickets.ga },
            { label: "Staff", count: pkg.tickets.staff },
          ].map(t => (
            <div key={t.label} className="bg-secondary rounded-lg p-3 text-center">
              <div className={`text-xs mb-1 ${t.count ? 'text-muted-foreground' : 'text-muted-foreground/25'}`}>{t.label}</div>
              <div className={`text-lg font-bold ${t.count ? 'text-foreground' : 'text-foreground/20'}`}>{t.count}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2 mb-4">
          {pkg.billboard && (
            <div className="flex items-start gap-2 text-sm">
              <span className="text-muted-foreground shrink-0 w-[5.5rem]">Billboard:</span>
              <span className="text-muted-foreground/80">{pkg.billboard}</span>
            </div>
          )}
          {pkg.speaking && (
            <div className="flex items-start gap-2 text-sm">
              <span className="text-muted-foreground shrink-0 w-[5.5rem]">Speaking:</span>
              <span className="text-muted-foreground/80">{pkg.speaking}</span>
            </div>
          )}
          {pkg.expoSpace && (
            <div className="flex items-start gap-2 text-sm">
              <span className="text-muted-foreground shrink-0 w-[5.5rem]">Expo Space:</span>
              <span className="text-muted-foreground/80">{pkg.expoSpace}</span>
            </div>
          )}
        </div>

        <div className="mt-auto">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-sm text-primary hover:text-primary/80 font-medium flex items-center justify-center gap-1 py-2 rounded-lg hover:bg-primary/5 transition-colors"
          >
            {expanded ? "Hide" : "Show"} Package Details
            <svg className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expanded && (
            <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
              {pkg.branding.map((item, i) => {
                const isHeader = item.startsWith("**") && item.endsWith("**");
                if (isHeader) {
                  return (
                    <li key={i} className={`text-sm font-semibold text-foreground ${i > 0 ? "mt-3 pt-2 border-t border-border/50" : ""}`}>
                      {item.replace(/\*\*/g, "")}
                    </li>
                  );
                }
                return (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-1 shrink-0">&bull;</span>
                    {item}
                  </li>
                );
              })}
            </ul>
          )}

          {onSelect && !isSoldOut && (
            <button
              onClick={() => onSelect(pkg)}
              className="w-full mt-4 py-2.5 rounded-lg border border-brand-teal/40 text-brand-teal text-sm font-semibold hover:bg-brand-teal/10 transition-colors"
            >
              Select Add-Ons
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
