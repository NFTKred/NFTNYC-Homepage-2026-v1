import { useState } from "react";
import { Check, Gift, Mic, Star, Trophy, Rocket, Target } from "lucide-react";
import CommunityPartnerModal from "./CommunityPartnerModal";

const steps = [
  {
    num: 1,
    title: "Enroll for $1,000",
    desc: "Register as a Community Partner and receive your unique affiliate ticket link. Your $1,000 enrollment includes a 5-minute speaking slot, your logo on the NFT.NYC website, and counts as your first $1,000 in sponsor credits.",
  },
  {
    num: 2,
    title: "Sell tickets and earn credits",
    desc: (
      <>
        Share your affiliate link with your community. For every ticket sold, you earn sponsor credits:
        <table className="mt-2 text-muted-foreground text-left">
          <tbody>
            <tr>
              <td className="pr-3 py-0.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                GA ticket sold
              </td>
              <td className="pr-3 py-0.5">=</td>
              <td className="pr-3 py-0.5 text-foreground font-medium">$50 credit</td>
              <td className="py-0.5">(10% of ticket price)</td>
            </tr>
            <tr>
              <td className="pr-3 py-0.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                VIP ticket sold
              </td>
              <td className="pr-3 py-0.5">=</td>
              <td className="pr-3 py-0.5 text-foreground font-medium">$200 credit</td>
              <td className="py-0.5">(~13% of ticket price)</td>
            </tr>
          </tbody>
        </table>
      </>
    ),
  },
  {
    num: 3,
    title: "Redeem credits toward any package",
    desc: "Apply your accumulated credits toward any sponsorship package or a la carte item. Credits can cover up to 50% of a package price. Combine credits with a cash payment to unlock larger packages.",
  },
];

const milestones = [
  { icon: Mic, label: "Enrollment", reward: "5 min speaking slot and logo on website", credits: "$1,000", pct: 6 },
  { icon: Gift, label: "25 GA tickets sold", reward: "2 GA passes to the event", credits: "$2,250", pct: 14 },
  { icon: Star, label: "50 GA tickets sold", reward: "Featured profile on NFT Giveaway site", credits: "$3,500", pct: 22 },
  { icon: Target, label: "100 GA tickets sold", reward: "Standard rooftop booth (fully earned)", credits: "$6,000", pct: 38 },
  { icon: Trophy, label: "200 GA tickets sold", reward: "Medium rooftop booth (fully earned)", credits: "$11,000", pct: 69 },
  { icon: Rocket, label: "300+ GA tickets sold", reward: "Credits toward any package + 5 min main stage speaking slot", credits: "$16,000+", pct: 100 },
];

const fineprint = [
  "Credits apply to sponsorship packages and a la carte items only — they cannot be redeemed for cash",
  "Credits can cover up to 50% of any package price (the remainder is paid in cash)",
  "Your $1,000 enrollment fee counts toward your credit balance",
  "Affiliate links must be registered to a company or project (individual registrations are not eligible)",
  "Credits must be redeemed by August 1, 2026. Unredeemed credits after this date are forfeited. This ensures all sponsorship logistics can be finalized before the event. Credits do not carry over",
  "If you do not reach any ticket sales milestone, your $1,000 enrollment still guarantees a 5-minute speaking slot and logo placement on the NFT.NYC website",
];

export default function CommunityPartner() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="relative max-w-7xl mx-auto px-6 py-20">
      {/* Top gradient border */}
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      {/* Header */}
      <div className="text-center mb-14">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
          Earn Your Way In
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Community Partner Program</h2>
        <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Earn your way to a sponsorship. Enroll for $1,000, sell tickets through your affiliate link, and turn commissions into sponsor credits toward any NFT.NYC 2026 package.
        </p>
      </div>

      {/* 3-Step Flow */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {steps.map((s) => (
          <div
            key={s.num}
            className="relative rounded-2xl border border-brand-border bg-card p-6 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                {s.num}
              </span>
              <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Milestones */}
      <div className="mb-14">
        <h3 className="text-xl font-bold text-foreground text-center mb-2">Credit Milestones</h3>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Rewards are cumulative — reaching 100 tickets includes all previous milestone rewards.
        </p>

        {/* Progress track */}
        <div className="relative">
          {/* Background bar */}
          <div className="hidden md:block absolute top-[2.25rem] left-0 right-0 h-1 bg-secondary rounded-full" />
          <div
            className="hidden md:block absolute top-[2.25rem] left-0 h-1 rounded-full"
            style={{
              width: "100%",
              background: "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.3) 100%)",
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {milestones.map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className="flex flex-col items-center text-center group">
                  <div className="relative z-10 flex items-center justify-center w-[4.5rem] h-[4.5rem] rounded-2xl bg-card border-2 border-primary/30 group-hover:border-primary transition-colors mb-3">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-primary mb-1">{m.credits}</span>
                  <span className="text-xs font-medium text-foreground mb-1 leading-tight">{m.label}</span>
                  <span className="text-[11px] text-muted-foreground leading-snug">{m.reward}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mb-12">
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          Become a Community Partner — $1,000
        </button>
      </div>

      <CommunityPartnerModal open={modalOpen} onOpenChange={setModalOpen} />

      {/* Fine print */}
      <div className="border-t border-brand-border pt-6">
        <ul className="space-y-1.5 max-w-3xl mx-auto">
          {fineprint.map((line, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground/70">
              <Check className="w-3 h-3 mt-0.5 shrink-0 text-muted-foreground/40" />
              {line}
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom gradient border */}
      <div className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
    </section>
  );
}
