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

/**
 * Generic "talk to partnerships" inquiry modal — distinct from
 * PackageInquiryModal in that no specific package is pre-selected. The
 * sponsor describes their goals and a projected budget; the partnerships
 * team designs a custom activation around that.
 *
 * Shares the same /functions/v1/partnership-inquiry edge function as
 * PackageInquiryModal — that function detects the absence of basePackage
 * and switches to "general inquiry" mode (different email subject/body,
 * pipeline package_name = "Custom inquiry", amount derived from budget).
 */

const INQUIRY_URL = "https://zgryfbuoarrlmocavodo.supabase.co/functions/v1/partnership-inquiry";

const BUDGET_OPTIONS = [
  "Under $25,000",
  "$25,000 – $50,000",
  "$50,000 – $100,000",
  "$100,000 – $250,000",
  "$250,000+",
  "Not sure yet",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PartnershipInquiryModal({ open, onOpenChange }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Reset whenever the modal is opened.
  useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      setCompany("");
      setPhone("");
      setBudget("");
      setNotes("");
      setSubmitted(false);
      setError("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

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
          projectedBudget: budget || undefined,
          inquiryType: "general",
          // No basePackage / addons for general inquiries
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to submit inquiry");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg + " Please try again or email team@nft.nyc directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-brand-border sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="sr-only">Inquiry received</DialogTitle>
            </DialogHeader>
            <div className="py-6 text-center">
              <p className="text-foreground font-bold mb-3 text-2xl">We're excited to work with you!</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                We've sent a confirmation email to{" "}
                <span className="text-foreground">{email}</span>
              </p>
              <p className="text-muted-foreground max-w-lg mx-auto mb-6 leading-relaxed">
                <span className="text-foreground font-semibold">NEXT STEP: Please schedule a meeting with our partnerships team</span>{" "}
                to work through the details and discuss your ideal experience.
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
                Talk to our partnerships team
              </DialogTitle>
              <DialogDescription asChild>
                <div className="mt-3">
                  <div className="rounded-lg border border-brand-coral/30 bg-brand-coral/5 px-4 py-3 mb-3">
                    <div className="text-xs font-medium tracking-[0.2em] uppercase text-brand-coral mb-1">
                      Custom Partnership
                    </div>
                    <div className="text-foreground font-semibold text-base leading-tight">
                      Tell us about your goals — we'll design a custom activation around them.
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Briefly share what you're looking for and a rough budget, and we'll follow up to schedule a call.
                  </p>
                </div>
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pi-gen-name" className="text-foreground text-sm">Name *</Label>
                  <Input
                    id="pi-gen-name"
                    placeholder="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="bg-secondary border-brand-border text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pi-gen-email" className="text-foreground text-sm">Email *</Label>
                  <Input
                    id="pi-gen-email"
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
                  <Label htmlFor="pi-gen-company" className="text-foreground text-sm">Company *</Label>
                  <Input
                    id="pi-gen-company"
                    placeholder="Your company"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    required
                    className="bg-secondary border-brand-border text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pi-gen-phone" className="text-foreground text-sm">Phone (optional)</Label>
                  <Input
                    id="pi-gen-phone"
                    type="tel"
                    placeholder="+1 555 000 0000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="bg-secondary border-brand-border text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pi-gen-budget" className="text-foreground text-sm">Projected budget</Label>
                <select
                  id="pi-gen-budget"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-secondary border border-brand-border text-foreground text-sm appearance-none cursor-pointer"
                  style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%239ca3af' d='M5 6L0 0h10z'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                    paddingRight: "32px",
                  }}
                >
                  <option value="">Select a range</option>
                  {BUDGET_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pi-gen-notes" className="text-foreground text-sm">Tell us about your goals (optional)</Label>
                <Textarea
                  id="pi-gen-notes"
                  placeholder="What are you hoping to achieve? Any specific activations, audiences, or moments you're targeting?"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={4}
                  className="bg-secondary border-brand-border text-foreground resize-none"
                />
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
