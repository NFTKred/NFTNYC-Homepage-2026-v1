/**
 * Reusable "Talk to partnerships" call-to-action.
 *
 * Three variants:
 *   - inline:  small text + button on one line. For tight spots near the
 *              hero or between sections.
 *   - card:    bordered box with eyebrow, headline, body, and CTA button.
 *              The mid-page workhorse; reads as a deliberate stop without
 *              breaking flow.
 *   - hero:    full-bleed emphasized section with a single primary CTA.
 *              Final closer before the footer.
 *
 * Every variant routes to the parent's "open generic inquiry modal"
 * handler — we deliberately don't link directly to the Calendly /book
 * URL anywhere on this page so leads always go through the form first.
 */

export type PartnershipCTAVariant = "inline" | "card" | "hero";

interface Props {
  variant: PartnershipCTAVariant;
  onClick: () => void;
  eyebrow?: string;
  title?: string;
  body?: string;
  ctaLabel?: string;
}

export default function PartnershipCTA({
  variant,
  onClick,
  eyebrow,
  title,
  body,
  ctaLabel = "Talk to partnerships",
}: Props) {
  if (variant === "inline") {
    return (
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-brand-coral/20 bg-brand-coral/5 px-5 py-4">
          <p className="text-sm text-foreground/90 leading-relaxed">
            {body ?? "Don't see your industry? We'll build a custom activation around your goals."}
          </p>
          <button
            onClick={onClick}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-coral text-white text-sm font-semibold hover:bg-brand-coral/90 transition-colors whitespace-nowrap"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="rounded-2xl border border-brand-coral/30 bg-gradient-to-br from-brand-coral/[0.07] to-brand-coral/[0.02] px-8 py-12 text-center">
          {eyebrow && (
            <p className="text-xs font-medium tracking-[0.25em] uppercase text-brand-coral mb-4">
              {eyebrow}
            </p>
          )}
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            {title ?? "Couldn't find what you were looking for?"}
          </h3>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            {body ?? "Tell us about your goals and budget. Our partnerships team will design a custom activation."}
          </p>
          <button
            onClick={onClick}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-brand-coral text-white font-semibold text-sm hover:bg-brand-coral/90 transition-colors shadow-lg shadow-brand-coral/20"
          >
            {ctaLabel}
          </button>
        </div>
      </section>
    );
  }

  // hero
  return (
    <section className="relative max-w-7xl mx-auto px-6 py-20">
      <div className="text-center">
        {eyebrow && (
          <p className="text-xs font-medium tracking-[0.25em] uppercase text-brand-coral mb-4">
            {eyebrow}
          </p>
        )}
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 uppercase tracking-tight">
          {title ?? "Ready to partner with NFT.NYC 2026?"}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-base sm:text-lg">
          {body ?? "Let's talk about how we can amplify your brand on the world's biggest stage."}
        </p>
        <button
          onClick={onClick}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-brand-coral text-white font-semibold text-sm hover:bg-brand-coral/90 transition-colors shadow-lg shadow-brand-coral/20"
        >
          {ctaLabel}
        </button>
      </div>
    </section>
  );
}
