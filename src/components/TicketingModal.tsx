import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CreditCard, Bitcoin, ChevronLeft, Minus, Plus } from "lucide-react";

/**
 * Global ticketing modal — single mount point for the "Earlybird Tickets"
 * flow site-wide. Any button anywhere can open it by dispatching:
 *
 *     window.dispatchEvent(new CustomEvent('nftnyc:open-ticketing'));
 *
 * Step 1: choose Credit Card (→ Eventbrite widget) or Cryptocurrency
 *         (→ Shopify-powered tier + quantity → checkout link).
 *
 * Step 2 (crypto only): pick ticket type + quantity, then forward to the
 *         Shopify checkout URL. Shopify shows current pricing at checkout
 *         so this page never has to ship stale numbers.
 */

const EVENTBRITE_EVENT_ID = "1985747187292";
const EVENTBRITE_PROMO_CODE = "Earlybird";

interface TicketTier {
  id: string;
  name: string;
  description: string;
  variantId: string;
}

const CRYPTO_TIERS: TicketTier[] = [
  {
    id: "ga",
    name: "General Admission",
    description: "Access to the main event and expo floor for the full conference.",
    variantId: "50045717315863",
  },
  {
    id: "vip",
    name: "VIP Access",
    description: "GA access plus the VIP Opening Party, Chandelier Room VIP Lounge, and priority seating.",
    variantId: "50045719052567",
  },
  {
    id: "elite",
    name: "Elite Access",
    description: "Everything in VIP plus front-of-house experiences and the elite reception.",
    variantId: "50045738516759",
  },
];

const MAX_QTY = 10;

/** Build the Shopify checkout URL for a given variant + quantity. */
function shopifyCheckoutUrl(variantId: string, qty: number): string {
  return `https://nftnyc.myshopify.com/cart/${variantId}:${encodeURIComponent(String(qty))}?channel=buy_button`;
}

/**
 * Ensures the Eventbrite widget is created once (lazy) and then triggers it.
 * The hidden #eb-trigger element is mounted by this component below — the
 * widget binds to that element by id and opens its modal.
 */
function openEventbriteWidget() {
  const w = window as unknown as {
    EBWidgets?: { createWidget: (config: Record<string, unknown>) => void };
    _ebWidgetReady?: boolean;
  };
  if (!w._ebWidgetReady) {
    if (w.EBWidgets?.createWidget) {
      w.EBWidgets.createWidget({
        widgetType: "checkout",
        eventId: EVENTBRITE_EVENT_ID,
        promoCode: EVENTBRITE_PROMO_CODE,
        themeSettings: {
          brandColor: "#f06347",
          fontColor: "#FFFFFF",
          background: "#111118",
        },
        modal: true,
        modalTriggerElementId: "eb-trigger",
        onOrderComplete: () => console.log("Order complete!"),
      });
      w._ebWidgetReady = true;
    }
  }
  // Defer one tick so widget code can wire up before we click.
  setTimeout(() => {
    const trigger = document.getElementById("eb-trigger");
    if (trigger) trigger.click();
  }, 100);
}

export default function TicketingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"choice" | "crypto">("choice");
  const [selectedTier, setSelectedTier] = useState<TicketTier>(CRYPTO_TIERS[0]);
  const [qty, setQty] = useState(1);

  // Listen for the global "open ticketing" event so every "Earlybird
  // Tickets" button across the site can fire this modal without holding
  // a ref to it.
  useEffect(() => {
    const handler = () => {
      setStep("choice");
      setSelectedTier(CRYPTO_TIERS[0]);
      setQty(1);
      setOpen(true);
    };
    window.addEventListener("nftnyc:open-ticketing", handler);
    return () => window.removeEventListener("nftnyc:open-ticketing", handler);
  }, []);

  const handleCardChoice = () => {
    // Close our modal first so Eventbrite's modal isn't stacked on top.
    setOpen(false);
    // Brief delay so the Radix dialog finishes its exit animation.
    setTimeout(openEventbriteWidget, 250);
  };

  const handleCryptoCheckout = () => {
    window.location.href = shopifyCheckoutUrl(selectedTier.variantId, qty);
  };

  return (
    <>
      {/* Hidden trigger used by the Eventbrite widget. Mounted once
          here so any number of callers can reuse it. */}
      <span id="eb-trigger" style={{ display: "none" }} aria-hidden="true" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-brand-border sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {step === "choice" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground text-xl">
                  Get your NFT.NYC 2026 ticket
                </DialogTitle>
                <DialogDescription asChild>
                  <p className="text-sm text-muted-foreground pt-1">
                    Choose how you'd like to pay. Earlybird pricing is applied automatically.
                  </p>
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCardChoice}
                  className="group flex items-center gap-4 rounded-xl border border-brand-border bg-secondary/40 hover:bg-brand-coral/10 hover:border-brand-coral/50 transition-colors p-5 text-left"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-coral/15 text-brand-coral">
                    <CreditCard size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground">Pay with card</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Checkout via Eventbrite. Visa, Mastercard, Amex, Apple Pay, Google Pay.
                    </div>
                  </div>
                  <span className="text-brand-coral text-sm font-semibold">→</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep("crypto")}
                  className="group flex items-center gap-4 rounded-xl border border-brand-border bg-secondary/40 hover:bg-brand-coral/10 hover:border-brand-coral/50 transition-colors p-5 text-left"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-coral/15 text-brand-coral">
                    <Bitcoin size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground">Pay with cryptocurrency</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Checkout via our Shopify store. BTC, ETH, USDC, and more.
                    </div>
                  </div>
                  <span className="text-brand-coral text-sm font-semibold">→</span>
                </button>
              </div>

              <p className="text-[11px] text-muted-foreground/60 text-center pt-4">
                Questions about tickets? Email{" "}
                <a href="mailto:team@nft.nyc" className="underline underline-offset-2">
                  team@nft.nyc
                </a>
                .
              </p>
            </>
          )}

          {step === "crypto" && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <button
                    type="button"
                    onClick={() => setStep("choice")}
                    className="-ml-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronLeft size={14} />
                    Back
                  </button>
                </div>
                <DialogTitle className="text-foreground text-xl">
                  Pay with cryptocurrency
                </DialogTitle>
                <DialogDescription asChild>
                  <p className="text-sm text-muted-foreground pt-1">
                    Select a ticket tier and quantity. You'll continue to our Shopify checkout to pay.
                  </p>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 pt-2">
                {CRYPTO_TIERS.map((tier) => {
                  const isSelected = tier.id === selectedTier.id;
                  return (
                    <label
                      key={tier.id}
                      className={`block cursor-pointer rounded-xl border p-4 transition-colors ${
                        isSelected
                          ? "border-brand-coral bg-brand-coral/10"
                          : "border-brand-border bg-secondary/40 hover:border-brand-coral/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="ticket-tier"
                        className="sr-only"
                        checked={isSelected}
                        onChange={() => setSelectedTier(tier)}
                      />
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            isSelected ? "border-brand-coral" : "border-muted-foreground/40"
                          }`}
                        >
                          {isSelected && (
                            <span className="h-2.5 w-2.5 rounded-full bg-brand-coral" />
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-foreground">{tier.name}</div>
                          <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {tier.description}
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="text-sm font-medium text-foreground">Quantity</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-border bg-secondary/40 hover:bg-brand-coral/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <div className="min-w-[2.5rem] text-center font-semibold text-foreground tabular-nums">
                    {qty}
                  </div>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
                    disabled={qty >= MAX_QTY}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-border bg-secondary/40 hover:bg-brand-coral/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCryptoCheckout}
                className="w-full py-3 rounded-xl bg-brand-coral text-white font-semibold text-base hover:bg-brand-coral/90 transition-colors shadow-lg shadow-brand-coral/20 mt-4"
              >
                Continue to checkout →
              </button>

              <p className="text-[11px] text-muted-foreground/60 text-center pt-2">
                You'll be redirected to <span className="text-foreground">nftnyc.myshopify.com</span> to complete your purchase.
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Imperative helper any component can call to open the ticketing modal —
 * an alternative to wiring `window.dispatchEvent` everywhere.
 */
export function openTicketing() {
  window.dispatchEvent(new CustomEvent("nftnyc:open-ticketing"));
}
