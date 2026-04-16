import { useState, useEffect } from "react";

const BB = "https://f005.backblazeb2.com/file/PB-HubSpot/";

const quotes = [
  { text: "The Super Bowl of NFTs", source: "Coinbase", image: BB + "coinbase-testimonial.jpg" },
  { text: "The new CES for NFTs", source: "Ledger", image: BB + "ledger-activation.png" },
  { text: "Our best marketing of the year", source: "Boson Protocol", image: BB + "times-square-boson-billboard.png" },
  { text: "The largest and most respected NFT conference in the world", source: "Forbes", image: BB + "expo-floor-busy.png" },
];

export default function Header() {
  const [activeQuote, setActiveQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuote((prev) => (prev + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Preload all hero images so transitions are seamless.
  useEffect(() => {
    quotes.forEach(q => {
      const img = new Image();
      img.src = q.image;
    });
  }, []);

  return (
    <header className="relative overflow-hidden bg-background">
      {/* Rotating background image — crossfades with each quote */}
      {quotes.map((q, i) => (
        <div
          key={q.source}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === activeQuote ? 1 : 0 }}
        >
          <img
            src={q.image}
            alt={`${q.source} at NFT.NYC`}
            className="w-full h-full object-cover"
            style={{ opacity: 0.7 }}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-coral/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-brand-orange/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 pt-40 pb-20 md:pt-48 md:pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-brand-coral/30 bg-brand-coral/10 text-brand-coral text-sm font-medium mb-8">
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
            className="text-brand-coral font-semibold mt-4 text-sm tracking-wide uppercase animate-fade-in"
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
            { value: "200k+", label: "Alumni" },
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

      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-coral/30 to-transparent" />
    </header>
  );
}
