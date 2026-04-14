import { useState, useEffect } from "react";

const quotes = [
  { text: "The Super Bowl of NFTs", source: "Coinbase" },
  { text: "The new CES for NFTs", source: "Ledger" },
  { text: "Our best marketing of the year", source: "Boson Protocol" },
  { text: "The largest and most respected NFT conference in the world", source: "Forbes" },
];

export default function Header() {
  const [activeQuote, setActiveQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuote((prev) => (prev + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative overflow-hidden bg-background">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-teal/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-brand-orange/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 pt-40 pb-20 md:pt-48 md:pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-brand-teal/30 bg-brand-teal/10 text-brand-teal text-sm font-medium mb-8">
          Partnership Opportunities
        </div>

        {/* Rotating testimonial */}
        <div className="max-w-3xl mx-auto mb-8 min-h-[120px] flex flex-col items-center justify-center">
          <p
            key={activeQuote}
            className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground italic leading-tight animate-fade-in"
          >
            &ldquo;{quotes[activeQuote].text}&rdquo;
          </p>
          <p
            key={`source-${activeQuote}`}
            className="text-brand-teal font-semibold mt-4 text-sm tracking-wide uppercase animate-fade-in"
          >
            &mdash; {quotes[activeQuote].source}
          </p>
        </div>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
          NFT.NYC - Where Builders, Brands, and Creators Shape the Future of Digital Ownership
        </p>

        <p className="text-sm tracking-[0.15em] uppercase text-muted-foreground/60 mb-14">
          Times Square, New York City &nbsp;|&nbsp; 1–3 September 2026
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          {[
            { value: "70k+", label: "Alumni" },
            { value: "3,900+", label: "Speakers to Date" },
            { value: "9th", label: "Annual Event" },
            { value: "100+", label: "Countries" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-teal/30 to-transparent" />
    </header>
  );
}
