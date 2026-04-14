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
  onEdit: (pkg: Package) => void;
  onDelete: (id: number | null) => void;
}

export default function PackageCard({ pkg, onEdit, onDelete }: PackageCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isSoldOut = pkg.availability === "Sold Out";

  return (
    <div className={`group relative bg-card border rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/40 ${isSoldOut ? "border-red-500/20 opacity-75" : "border-border"}`}>
      {pkg.tier === "premium" && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-orange via-brand-teal to-brand-orange" />
      )}

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {pkg.tier === "premium" && <Badge variant="premium">Premium</Badge>}
              <Badge variant={isSoldOut ? "soldOut" : "default"}>
                {pkg.availability}
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-foreground">{pkg.name}</h3>
          </div>
          <div className="flex gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(pkg)}
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Edit package"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(pkg.id)}
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
              title="Delete package"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <p className="text-2xl font-bold text-brand-orange mb-3">{pkg.price}</p>
        <p className="text-muted-foreground text-sm mb-4">{pkg.description}</p>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-secondary rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">VIP</div>
            <div className="text-lg font-bold text-foreground">{pkg.tickets.vip}</div>
          </div>
          <div className="bg-secondary rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">GA</div>
            <div className="text-lg font-bold text-foreground">{pkg.tickets.ga}</div>
          </div>
          <div className="bg-secondary rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Staff</div>
            <div className="text-lg font-bold text-foreground">{pkg.tickets.staff}</div>
          </div>
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

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-sm text-primary hover:text-primary/80 font-medium flex items-center justify-center gap-1 py-2 rounded-lg hover:bg-primary/5 transition-colors"
        >
          {expanded ? "Hide" : "Show"} Branding Details
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
      </div>
    </div>
  );
}
