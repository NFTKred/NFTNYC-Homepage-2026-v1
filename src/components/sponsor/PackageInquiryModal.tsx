import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { defaultAlaCarte } from "@/data/sponsor/packages";

// Partnership-inquiry proxy Edge Function (deployed alongside the main
// Supabase project). It validates input, forwards a record to the CRM,
// and emails team@nft.nyc with the full submission details.
const INQUIRY_URL = "https://zgryfbuoarrlmocavodo.supabase.co/functions/v1/partnership-inquiry";

// Packages whose price is hidden from the UI — these are shown as "Request"
// opportunities that go through a custom conversation rather than fixed-price selection.
const HIDDEN_PRICE_PACKAGES = new Set(["$500,000", "$200,000", "$120,000"]);

export interface BasePackage {
  name: string;
  price: string;
  tier?: string;
  context: "community" | "packages"; // which sponsor tab the lead came from
  trackName?: string; // only set when context === 'community'
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  basePackage: BasePackage | null;
  /** Optional page-specific label for the notes field. Default: "Anything else to share? (optional)" */
  notesLabel?: string;
  /** Optional page-specific placeholder for the notes field. */
  notesPlaceholder?: string;
}

export default function PackageInquiryModal({ open, onOpenChange, basePackage, notesLabel, notesPlaceholder }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [addons, setAddons] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Reset form whenever the modal is opened against a new base package.
  useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      setCompany("");
      setPhone("");
      setNotes("");
      setAddons(new Set());
      setSubmitted(false);
      setError("");
    }
  }, [open, basePackage?.name]);

  const toggleAddon = (id: string) => {
    setAddons(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!basePackage) return;
    setSubmitting(true);
    setError("");

    const selectedAddons = defaultAlaCarte
      .filter(a => addons.has(String(a.id)))
      .map(a => ({ name: a.name, price: a.price }));

    try {
      const res = await fetch(INQUIRY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          phone,
          notes,
          basePackage: {
            name: basePackage.name,
            price: basePackage.price,
            tier: basePackage.tier,
            context: basePackage.context,
            trackName: basePackage.trackName,
          },
          addons: selectedAddons,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to submit inquiry");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again or email team@nft.nyc directly.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!basePackage) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-brand-border sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <>
            {/* Radix requires a DialogTitle for accessibility even when
                we don't render a visible heading. */}
            <DialogHeader>
              <DialogTitle className="sr-only">Inquiry received</DialogTitle>
            </DialogHeader>
            <div className="py-6 text-center">
              <p className="text-foreground font-bold mb-3 text-2xl">We're excited to work with you!</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                We've sent a confirmation email to{" "}
                <span className="text-foreground">{email}</span>
              </p>
              <p className="text-foreground font-semibold max-w-lg mx-auto mb-6 leading-relaxed">
                NEXT STEP: Please schedule a meeting with our partnerships team to work through the details and discuss your ideal experience.
              </p>
              <a
                href="https://www.nft.nyc/book"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-brand-coral hover:bg-brand-coral/90 text-white font-semibold text-sm transition-colors shadow-lg shadow-brand-coral/20"
              >
                Schedule a meeting →
              </a>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-foreground text-xl">
                Learn more about this package
              </DialogTitle>
              <DialogDescription asChild>
                <div className="mt-3">
                  <div className="rounded-lg border border-brand-coral/30 bg-brand-coral/5 px-4 py-3 mb-3">
                    <div className="text-foreground font-semibold text-base leading-tight">{basePackage.name}</div>
                    {(!HIDDEN_PRICE_PACKAGES.has(basePackage.price) || basePackage.trackName) && (
                      <div className="flex items-center gap-2 mt-1">
                        {!HIDDEN_PRICE_PACKAGES.has(basePackage.price) && (
                          <span className="text-brand-coral font-bold text-lg">{basePackage.price}</span>
                        )}
                        {basePackage.trackName && (
                          <span className="text-xs font-medium text-muted-foreground">· {basePackage.trackName}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Tell us a bit about yourself and we'll follow up to schedule a call.</p>
                </div>
              </DialogDescription>
            </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="pi-name" className="text-foreground text-sm">Name *</Label>
                <Input
                  id="pi-name"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="bg-secondary border-brand-border text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pi-email" className="text-foreground text-sm">Email *</Label>
                <Input
                  id="pi-email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="bg-secondary border-brand-border text-foreground"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="pi-company" className="text-foreground text-sm">Company *</Label>
                <Input
                  id="pi-company"
                  placeholder="Your company"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  required
                  className="bg-secondary border-brand-border text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pi-phone" className="text-foreground text-sm">Phone (optional)</Label>
                <Input
                  id="pi-phone"
                  type="tel"
                  placeholder="+1 555 000 0000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="bg-secondary border-brand-border text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pi-notes" className="text-foreground text-sm">{notesLabel ?? "Anything else to share? (optional)"}</Label>
              <Textarea
                id="pi-notes"
                placeholder={notesPlaceholder ?? "Goals, questions, specific activations you're interested in…"}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="bg-secondary border-brand-border text-foreground resize-none"
              />
            </div>

            {/* Add-ons */}
            <div className="pt-2">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-brand-coral mb-2">
                Add-ons (optional)
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Select any add-ons you'd like to pair with this package — we'll include them in the conversation.
              </p>
              <div className="grid sm:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
                {defaultAlaCarte.map(a => {
                  const id = String(a.id);
                  const checked = addons.has(id);
                  return (
                    <label
                      key={id}
                      className={`flex items-start gap-2 rounded-lg border p-2.5 cursor-pointer text-sm transition-colors ${
                        checked
                          ? "border-brand-coral/60 bg-brand-coral/5"
                          : "border-brand-border bg-secondary hover:border-brand-coral/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAddon(id)}
                        className="mt-0.5 accent-[#f06347]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium text-foreground leading-tight">{a.name}</span>
                          <span className="text-xs font-semibold text-brand-coral shrink-0">{a.price}</span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={!name || !email || !company || submitting}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Sending…" : "Request a Call"}
            </button>

            <p className="text-[11px] text-muted-foreground/60 text-center">
              We'll email you at {email || "your inbox"} within 1 business day. Prefer email?{" "}
              <a href="mailto:team@nft.nyc" className="underline underline-offset-2">team@nft.nyc</a>.
            </p>
          </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
