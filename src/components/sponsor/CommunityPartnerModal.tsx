import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const packages = [
  "Community Partner Program ($1,000)",
  "Standard Rooftop Booth ($5,000)",
  "Medium Rooftop Booth ($10,000)",
  "Large Rooftop Booth ($20,000)",
  "Title Sponsor ($150,000)",
  "Presenting Sponsor ($100,000)",
  "Diamond Sponsor ($75,000)",
  "Platinum Sponsor ($50,000)",
  "Gold Sponsor ($30,000)",
  "Silver Sponsor ($15,000)",
  "A La Carte Options",
  "Custom Package",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommunityPartnerModal({ open, onOpenChange }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [packageInterest, setPackageInterest] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Save to database
      const { error: dbError } = await supabase
        .from("partner_inquiries")
        .insert({ name, email, package_interest: packageInterest });

      if (dbError) throw dbError;

      // Send email notification
      await supabase.functions.invoke("notify-partner-inquiry", {
        body: { name, email, packageInterest },
      });

      setSubmitted(true);
    } catch (err: any) {
      setError("Something went wrong. Please try again or email team@nft.nyc directly.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setSubmitted(false);
      setName("");
      setEmail("");
      setPackageInterest("");
      setError("");
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-brand-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl">
            Become a Community Partner
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Submit your interest and our team will follow up with next steps.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-6 text-center">
            <p className="text-foreground font-semibold mb-2">Thank you!</p>
            <p className="text-sm text-muted-foreground">
              We've received your interest. Our team will reach out to you at{" "}
              <span className="text-foreground">{email}</span> shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="cp-name" className="text-foreground">
                Name
              </Label>
              <Input
                id="cp-name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-secondary border-brand-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cp-email" className="text-foreground">
                Email Address
              </Label>
              <Input
                id="cp-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-secondary border-brand-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cp-package" className="text-foreground">
                Package Interested In
              </Label>
              <Select value={packageInterest} onValueChange={setPackageInterest} required>
                <SelectTrigger className="bg-secondary border-brand-border text-foreground">
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent className="bg-card border-brand-border">
                  {packages.map((pkg) => (
                    <SelectItem key={pkg} value={pkg} className="text-foreground">
                      {pkg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            <button
              type="submit"
              disabled={!name || !email || !packageInterest || submitting}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Interest"}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
