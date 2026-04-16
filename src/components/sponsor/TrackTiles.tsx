import { trackIcons } from "@/data/sponsor/trackIcons";

interface TrackTilesProps {
  selected: string | null;
  onSelect: (track: string) => void;
}

const trackNames = [
  "AI Identity Tokenization",
  "Game Tokenization",
  "On-Chain Infrastructure",
  "Social NFTs",
  "Creator Economy",
  "DeFi",
  "RWA Tokenization",
  "Brands & Engagement",
  "Culture, Art & Music",
  "DNS ENS Domain Tokens",
  "DeSci · Longevity Tokenization",
  "NFT Marketplaces",
];

export default function TrackTiles({ selected, onSelect }: TrackTilesProps) {
  const selectedTrack = selected ? trackIcons[selected] : null;

  return (
    <section className="relative bg-background pt-10 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-xs font-medium tracking-[0.25em] uppercase text-brand-coral mb-3">
          Industry Focused
        </p>
        <h2 className="text-3xl font-bold text-foreground mb-3">
          Sponsorship by Community
        </h2>
        <p className="text-muted-foreground mb-10 max-w-2xl">
          Target the specific segment of the NFT.NYC community that aligns with your brand and product
        </p>

        <div className="flex flex-wrap gap-2">
          {trackNames.map((name) => {
            const isSelected = selected === name;
            return (
              <button
                key={name}
                onClick={() => onSelect(isSelected ? "" : name)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                  isSelected
                    ? "text-white border-transparent"
                    : "bg-secondary text-muted-foreground border-border hover:text-foreground hover:border-foreground/20"
                }`}
                style={isSelected ? { backgroundColor: trackIcons[name]?.color ?? '#f06347', borderColor: trackIcons[name]?.color ?? '#f06347' } : undefined}
              >
                {name}
              </button>
            );
          })}
        </div>

        {selected && selectedTrack && (
          <div className="flex flex-col items-center mt-16 mb-0 animate-fade-in">
            <div className="transition-transform duration-300 scale-[2.5]">{selectedTrack.icon}</div>
            <h3 className="text-2xl font-bold text-foreground mt-10">{selected}</h3>
          </div>
        )}
      </div>
    </section>
  );
}
