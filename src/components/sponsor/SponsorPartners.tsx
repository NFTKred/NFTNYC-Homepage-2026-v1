import { useState } from "react";

const partners = [
  { name: "Polygon", domain: "polygon.technology" },
  { name: "Flow", domain: "flow.com" },
  { name: "TRON", domain: "tron.network" },
  { name: "Immutable", domain: "immutable.com" },
  { name: "Algorand", domain: "algorand.com" },
  { name: "WAX", domain: "wax.io" },
  { name: "AWS", domain: "aws.amazon.com" },
  { name: "PwC", domain: "pwc.com" },
  { name: "Canon", domain: "canon.com" },
  { name: "Samsung NEXT", domain: "samsungnext.com" },
  { name: "Christie's", domain: "christies.com" },
  { name: "Sony", domain: "sony.com" },
  { name: "McCain", domain: "mccain.com" },
  { name: "Brave", domain: "brave.com" },
  { name: "DraftKings", domain: "draftkings.com" },
  { name: "EY", domain: "ey.com" },
  { name: "MoonPay", domain: "moonpay.com" },
  { name: "Magic Eden", domain: "magiceden.io" },
  { name: "0x", domain: "0x.org" },
  { name: "Doodles", domain: "doodles.app" },
  { name: "ConsenSys", domain: "consensys.io" },
  { name: "Rarible", domain: "rarible.com" },
  { name: "DappRadar", domain: "dappradar.com" },
  { name: "Messari", domain: "messari.io" },
];

function PartnerLogo({ name, domain }: { name: string; domain: string }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center px-3 py-5 rounded-xl bg-secondary/50 border border-border hover:border-brand-teal/30 transition-colors gap-2">
      {!imgError ? (
        <img
          src={`https://logo.clearbit.com/${domain}`}
          alt={`${name} logo`}
          className="h-8 w-8 object-contain"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
          {name.charAt(0)}
        </div>
      )}
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
            <PartnerLogo key={p.name} name={p.name} domain={p.domain} />
          ))}
        </div>
      </div>
    </section>
  );
}
