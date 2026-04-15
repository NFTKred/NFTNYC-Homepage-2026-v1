const partners = [
  { name: "Polygon", logo: "/sponsors/polygon.svg" },
  { name: "Flow", logo: "/sponsors/flow.svg" },
  { name: "TRON", logo: "/sponsors/tron.svg" },
  { name: "Immutable", logo: "/sponsors/immutable.svg" },
  { name: "Algorand", logo: "/sponsors/algorand.svg" },
  { name: "WAX", logo: "https://f005.backblazeb2.com/file/PB-HubSpot/files/wax-logo.png" },
  { name: "AWS", logo: "/sponsors/aws.svg" },
  { name: "PwC", logo: "/sponsors/pwc.svg" },
  { name: "Canon", logo: "/sponsors/canon.svg" },
  { name: "Samsung NEXT", logo: "/sponsors/samsung-next.png" },
  { name: "Christie's", logo: "/sponsors/christies.svg" },
  { name: "Sony", logo: "/sponsors/sony.svg" },
  { name: "McCain", logo: "/sponsors/mccain.svg" },
  { name: "Brave", logo: "/sponsors/brave.svg" },
  { name: "DraftKings", logo: "/sponsors/draftkings.svg" },
  { name: "EY", logo: "/sponsors/ey.svg" },
  { name: "MoonPay", logo: "https://f005.backblazeb2.com/file/PB-HubSpot/moonpay-logo-full.png" },
  { name: "Magic Eden", logo: "/sponsors/magic-eden.svg" },
  { name: "0x", logo: "/sponsors/0x.svg" },
  { name: "Doodles", logo: "/sponsors/doodles.svg" },
  { name: "ConsenSys", logo: "/sponsors/consensys.svg" },
  { name: "Rarible", logo: "/sponsors/rarible.svg" },
  { name: "DappRadar", logo: "/sponsors/dappradar.svg" },
  { name: "Messari", logo: "/sponsors/messari.svg" },
];

const LOGO_FILTERS: Record<string, string> = {
  "Christie's": "invert(1)",
  "Samsung NEXT": "saturate(0) brightness(2.5)",
};

function PartnerLogo({ name, logo }: { name: string; logo: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-3 py-5 rounded-xl bg-secondary/50 border border-border hover:border-brand-teal/30 transition-colors gap-2">
      <img
        src={logo}
        alt={`${name} logo`}
        className="h-8 w-auto object-contain max-w-[80px]"
        loading="lazy"
        style={LOGO_FILTERS[name] ? { filter: LOGO_FILTERS[name] } : undefined}
      />
      <span className="text-xs font-medium text-muted-foreground text-center leading-tight">
        {name}
      </span>
    </div>
  );
}

export default function Partners() {
  return (
    <section className="relative bg-background py-20">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-xs font-medium tracking-[0.25em] uppercase text-brand-teal text-center mb-3">
          Our Partners
        </p>
        <h2 className="text-3xl font-bold text-foreground text-center mb-3">
          Trusted by Industry Leaders
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Since 2019, NFT.NYC has partnered with the leading Enterprise brands across blockchains, Fortune 500 companies, and the NFT ecosystem.
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {partners.map((p) => (
            <PartnerLogo key={p.name} name={p.name} logo={p.logo} />
          ))}
        </div>
      </div>
    </section>
  );
}
