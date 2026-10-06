import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  Check, 
  Crown, 
  Sparkles, 
  Zap, 
  Shield, 
  ArrowRight, 
  Calculator, 
  CreditCard, 
  CheckCircle2, 
  X, 
  Gift, 
  Award,
  Clock,
  ChevronRight,
  Flame
} from "lucide-react";
import { useState } from "react";
import { Badge, Button, SectionHeading } from "@/components/ui";
import { membershipPlans } from "@/data/membership";
import { useAuthStore } from "@/store/useAuthStore";
import type { MembershipPlan, MembershipTier } from "@/types";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Membership Plans & Annual Pass — Playo" },
      {
        name: "description",
        content:
          "Upgrade to Playo Play, Pro, or Annual All-Access Pass for exclusive booking discounts, 2.5x TurfPoints, and zero-fee rescheduling.",
      },
      { property: "og:title", content: "Membership Plans & Annual Pass — Playo" },
      {
        property: "og:description",
        content:
          "Upgrade to Playo Play, Pro, or Annual All-Access Pass for exclusive booking discounts, 2.5x TurfPoints, and zero-fee rescheduling.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: MembershipPage,
});

function MembershipPage() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const updateMembership = useAuthStore((s) => s.updateMembership);

  const currentTier = user?.membershipTier ?? "free";
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  
  // Interactive Savings Calculator state
  const [matchesPerMonth, setMatchesPerMonth] = useState<number>(4);
  const avgMatchCost = 1000; // Average turf hourly booking cost

  // Checkout Modal state
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<MembershipPlan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"upi" | "card" | "points">("upi");
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const handleOpenCheckout = (plan: MembershipPlan) => {
    if (plan.tier === "free") {
      updateMembership("free", "monthly");
      return;
    }
    setSelectedPlanForCheckout(plan);
    setCheckoutSuccess(false);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPlanForCheckout) return;
    setIsProcessingCheckout(true);
    await new Promise((r) => setTimeout(r, 650));
    
    const cycle = selectedPlanForCheckout.tier === "annual_pass" ? "annual" : billingCycle;
    updateMembership(selectedPlanForCheckout.tier, cycle);
    setIsProcessingCheckout(false);
    setCheckoutSuccess(true);
  };

  return (
    <div className="container-page py-12 space-y-12">
      {/* Header & Subtitle */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-black text-primary">
          <Sparkles className="size-3.5" />
          PLAYO MEMBERSHIP PROGRAM
        </span>
        <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight text-foreground">
          PLAY MORE. PAY LESS.
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Unlock instant discounts on every sports arena, earn up to 2.5x TurfPoints, skip cancellation penalties, and get VIP early booking access across India.
        </p>

        {/* Billing Cycle Switcher */}
        <div className="pt-2 flex items-center justify-center">
          <div className="inline-flex items-center rounded-full border border-border bg-card p-1 shadow-xs">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
                billingCycle === "monthly"
                  ? "bg-foreground text-background shadow-xs font-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`relative rounded-full px-5 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === "annual"
                  ? "bg-primary text-primary-foreground shadow-xs font-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Annual Billing</span>
              <span className="rounded-full bg-emerald-500 text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-tight">
                Save 25%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Plan Cards Grid (4 Tiers) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 items-stretch">
        {membershipPlans.map((plan) => {
          const isCurrent = currentTier === plan.tier;
          const isAnnualPass = plan.tier === "annual_pass";
          const isPro = plan.tier === "pro";
          const isPlay = plan.tier === "play";

          // Calculate displayed price based on selected billing cycle
          let displayPrice = plan.price;
          let periodLabel = "/ month";
          if (isAnnualPass) {
            displayPrice = plan.annualPrice!;
            periodLabel = "/ year (All-Access)";
          } else if (billingCycle === "annual" && plan.annualPrice) {
            displayPrice = Math.round(plan.annualPrice / 12);
            periodLabel = "/ mo, billed annually";
          }

          return (
            <article
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 ${
                isAnnualPass
                  ? "border-amber-400/80 bg-gradient-to-b from-amber-500/10 via-card to-card ring-2 ring-amber-400/40 shadow-xl"
                  : isPro
                    ? "border-primary bg-foreground text-background shadow-2xl lg:scale-[1.03]"
                    : isPlay
                      ? "border-primary/40 bg-card shadow-md ring-1 ring-primary/20"
                      : "border-border bg-card"
              }`}
            >
              {/* Top Badges */}
              {isAnnualPass && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-black text-black shadow-md uppercase tracking-wider">
                    <Crown className="size-3.5" />
                    BEST VALUE VIP
                  </span>
                </div>
              )}

              {isPro && !isAnnualPass && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-black text-primary-foreground shadow-md uppercase tracking-wider">
                    <Flame className="size-3.5" />
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3
                    className={`font-display text-2xl font-black tracking-tight ${
                      isAnnualPass
                        ? "text-amber-500"
                        : isPro
                          ? "text-primary"
                          : "text-foreground"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  {isCurrent && (
                    <Badge tone={isAnnualPass ? "gold" : isPro ? "gold" : "green"}>
                      CURRENT
                    </Badge>
                  )}
                </div>

                <p
                  className={`mt-1.5 text-xs font-medium leading-relaxed ${
                    isPro ? "text-background/70" : "text-muted-foreground"
                  }`}
                >
                  {plan.tagline}
                </p>

                {/* Price Display */}
                <div className="mt-5 flex items-baseline gap-1">
                  <span
                    className={`font-display text-4xl sm:text-5xl font-black ${
                      isAnnualPass
                        ? "text-foreground"
                        : isPro
                          ? "text-background"
                          : "text-foreground"
                    }`}
                  >
                    {displayPrice === 0 ? "Free" : `₹${displayPrice.toLocaleString("en-IN")}`}
                  </span>
                  {displayPrice > 0 && (
                    <span
                      className={`text-xs font-semibold ${
                        isPro ? "text-background/60" : "text-muted-foreground"
                      }`}
                    >
                      {periodLabel}
                    </span>
                  )}
                </div>

                {billingCycle === "annual" && plan.annualPrice && plan.price > 0 && !isAnnualPass && (
                  <p className="mt-1 text-[11px] font-bold text-emerald-500">
                    Billed ₹{plan.annualPrice} yearly ({plan.savingsBadge})
                  </p>
                )}

                {/* Key Metrics Chips */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div
                    className={`rounded-lg p-2 text-center ${
                      isPro ? "bg-white/10" : "bg-secondary"
                    }`}
                  >
                    <p
                      className={`text-[9px] uppercase font-bold tracking-tight ${
                        isPro ? "text-background/60" : "text-muted-foreground"
                      }`}
                    >
                      Discount
                    </p>
                    <p
                      className={`text-base font-black ${
                        isAnnualPass
                          ? "text-amber-500"
                          : isPro
                            ? "text-primary"
                            : "text-foreground"
                      }`}
                    >
                      {plan.discountPercent}% Off
                    </p>
                  </div>
                  <div
                    className={`rounded-lg p-2 text-center ${
                      isPro ? "bg-white/10" : "bg-secondary"
                    }`}
                  >
                    <p
                      className={`text-[9px] uppercase font-bold tracking-tight ${
                        isPro ? "text-background/60" : "text-muted-foreground"
                      }`}
                    >
                      TurfPoints
                    </p>
                    <p
                      className={`text-base font-black ${
                        isAnnualPass
                          ? "text-amber-500"
                          : isPro
                            ? "text-primary"
                            : "text-foreground"
                      }`}
                    >
                      {plan.rewardMultiplier}x Multiplier
                    </p>
                  </div>
                </div>

                {/* Benefits List */}
                <ul className="mt-5 space-y-2.5">
                  {plan.benefits.map((benefit) => (
                    <li
                      key={benefit}
                      className={`flex items-start gap-2 text-xs font-semibold ${
                        isPro ? "text-background/90" : "text-foreground"
                      }`}
                    >
                      <Check
                        className={`size-3.5 shrink-0 mt-0.5 ${
                          isAnnualPass
                            ? "text-amber-500"
                            : isPro
                              ? "text-primary"
                              : "text-success"
                        }`}
                      />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-border/40">
                {isCurrent ? (
                  <Button disabled className="w-full bg-muted text-muted-foreground text-xs font-bold">
                    Active Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleOpenCheckout(plan)}
                    variant={
                      isAnnualPass
                        ? "primary"
                        : isPro
                          ? "primary"
                          : isPlay
                            ? "primary"
                            : "outline"
                    }
                    className={`w-full text-xs font-black ${
                      isAnnualPass ? "bg-amber-500 hover:bg-amber-400 text-black border-amber-500" : ""
                    }`}
                  >
                    {plan.price === 0
                      ? "Switch to Free"
                      : isAnnualPass
                        ? "Get Annual Pass"
                        : `Select ${plan.name}`}
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Interactive Savings & ROI Calculator */}
      <section className="card-shell p-6 md:p-8 bg-gradient-to-br from-card via-secondary/30 to-card border border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
          <div>
            <span className="eyebrow flex items-center gap-1.5 text-primary">
              <Calculator className="size-3.5" />
              ROI Calculator
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-black">
              SEE HOW MUCH YOU SAVE
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Adjust your monthly match frequency to see your net savings with each membership tier.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
            <span className="text-xs font-bold text-muted-foreground">Playing:</span>
            <span className="font-display text-2xl font-black text-primary">
              {matchesPerMonth} {matchesPerMonth === 1 ? "Match" : "Matches"}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">/ month</span>
          </div>
        </div>

        {/* Range Slider */}
        <div className="py-6 space-y-2">
          <input
            type="range"
            min={1}
            max={12}
            value={matchesPerMonth}
            onChange={(e) => setMatchesPerMonth(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[11px] font-bold text-muted-foreground">
            <span>1 match / mo (Casual)</span>
            <span>4 matches / mo (Weekly)</span>
            <span>8 matches / mo (Bi-weekly)</span>
            <span>12 matches / mo (Pro Team)</span>
          </div>
        </div>

        {/* Projected Monthly Savings Breakdown */}
        <div className="grid gap-4 sm:grid-cols-3 pt-2">
          {/* Play Plan Projection */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-extrabold text-info uppercase">Playo Play (10% Off)</p>
            <p className="font-display text-3xl font-black mt-2 text-foreground">
              ₹{matchesPerMonth * avgMatchCost * 0.1}
              <span className="text-xs font-normal text-muted-foreground"> / mo saved</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Net savings: <strong className="text-success">₹{(matchesPerMonth * avgMatchCost * 0.1) - 199}</strong> after plan cost.
            </p>
          </div>

          {/* Pro Plan Projection */}
          <div className="rounded-xl border border-primary/50 bg-primary/5 p-4">
            <p className="text-xs font-extrabold text-primary uppercase">Playo Pro (20% Off)</p>
            <p className="font-display text-3xl font-black mt-2 text-foreground">
              ₹{matchesPerMonth * avgMatchCost * 0.2}
              <span className="text-xs font-normal text-muted-foreground"> / mo saved</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Net savings: <strong className="text-success">₹{(matchesPerMonth * avgMatchCost * 0.2) - 499}</strong> after plan cost.
            </p>
          </div>

          {/* Annual Pass Projection */}
          <div className="rounded-xl border border-amber-400 bg-amber-500/10 p-4">
            <p className="text-xs font-extrabold text-amber-500 uppercase">Annual Pass (25% Off)</p>
            <p className="font-display text-3xl font-black mt-2 text-foreground">
              ₹{matchesPerMonth * avgMatchCost * 0.25}
              <span className="text-xs font-normal text-muted-foreground"> / mo saved</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Yearly savings: <strong className="text-success">₹{(matchesPerMonth * avgMatchCost * 0.25 * 12) - 1999}</strong> / year.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="card-shell p-6 md:p-8">
        <h3 className="font-display text-2xl sm:text-3xl font-black mb-6">
          DETAILED BENEFIT COMPARISON
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[650px]">
            <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground font-black">
              <tr>
                <th className="p-3.5">Perks & Privileges</th>
                <th className="p-3.5">Free</th>
                <th className="p-3.5">Play</th>
                <th className="p-3.5 text-primary">Pro</th>
                <th className="p-3.5 text-amber-500 font-extrabold">Annual Pass</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs sm:text-sm">
              <tr>
                <td className="p-3.5 font-semibold">Turf Booking Discount</td>
                <td className="p-3.5 text-muted-foreground">0%</td>
                <td className="p-3.5 font-bold text-success">10% Off</td>
                <td className="p-3.5 font-bold text-primary">20% Off</td>
                <td className="p-3.5 font-black text-amber-500">25% Off (Max)</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold">TurfPoints Multiplier</td>
                <td className="p-3.5 text-muted-foreground">1.0x (Standard)</td>
                <td className="p-3.5 font-bold text-info">1.5x Boost</td>
                <td className="p-3.5 font-bold text-primary">2.0x Boost</td>
                <td className="p-3.5 font-black text-amber-500">2.5x VIP Boost</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold">Priority Booking Window</td>
                <td className="p-3.5 text-muted-foreground">Standard</td>
                <td className="p-3.5">24h Early Access</td>
                <td className="p-3.5 font-bold text-primary">48h Early Access</td>
                <td className="p-3.5 font-black text-amber-500">VIP 48h Advance Hold</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold">Free Cancellation Window</td>
                <td className="p-3.5 text-muted-foreground">Up to 12 hours</td>
                <td className="p-3.5">Up to 4 hours</td>
                <td className="p-3.5 font-bold text-success">Up to 2 hours</td>
                <td className="p-3.5 font-black text-amber-500">Zero-Fee Rescheduling</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold">Platform & Convenience Fees</td>
                <td className="p-3.5 text-muted-foreground">Standard ₹35</td>
                <td className="p-3.5">₹15</td>
                <td className="p-3.5 font-bold text-success">₹0 Waived</td>
                <td className="p-3.5 font-black text-amber-500">₹0 Waived Forever</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold">Tournament Ticket Entry</td>
                <td className="p-3.5 text-muted-foreground">Paid Entry</td>
                <td className="p-3.5">10% Off Entry</td>
                <td className="p-3.5 font-bold text-primary">25% Off Entry</td>
                <td className="p-3.5 font-black text-amber-500">1 Free Cup Entry</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold">Customer Support</td>
                <td className="p-3.5 text-muted-foreground">Email</td>
                <td className="p-3.5">Chat Support</td>
                <td className="p-3.5 font-bold text-primary">Priority Agent</td>
                <td className="p-3.5 font-black text-amber-500">Dedicated VIP Concierge</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Checkout / Mock Payment Modal */}
      {selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedPlanForCheckout(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            {!checkoutSuccess ? (
              <div className="space-y-5">
                <div>
                  <span className="eyebrow text-primary">Secure Mock Checkout</span>
                  <h3 className="font-display text-2xl font-black text-foreground">
                    ACTIVATE {selectedPlanForCheckout.name.toUpperCase()}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Instant activation. All discounts apply automatically to your account.
                  </p>
                </div>

                {/* Plan Summary Card */}
                <div className="rounded-xl border border-border bg-secondary/50 p-4 space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span>Selected Plan</span>
                    <span className="text-primary font-black">{selectedPlanForCheckout.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Billing Term</span>
                    <span className="capitalize font-semibold">
                      {selectedPlanForCheckout.tier === "annual_pass" ? "12 Months (Annual Pass)" : billingCycle}
                    </span>
                  </div>
                  <div className="border-t border-border/60 pt-2 flex justify-between items-baseline">
                    <span className="text-xs font-bold">Total Amount Due</span>
                    <span className="font-display text-2xl font-black text-foreground">
                      ₹{selectedPlanForCheckout.tier === "annual_pass"
                        ? selectedPlanForCheckout.annualPrice
                        : billingCycle === "annual"
                          ? selectedPlanForCheckout.annualPrice
                          : selectedPlanForCheckout.price}
                    </span>
                  </div>
                </div>

                {/* Mock Payment Method Selector */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                    Select Payment Method (Mock)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "upi", label: "UPI", desc: "GPay / PhonePe" },
                      { id: "card", label: "Cards", desc: "Debit / Credit" },
                      { id: "points", label: "Points", desc: "TurfPoints" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedPaymentMethod(m.id as any)}
                        className={`rounded-lg border p-2.5 text-center transition ${
                          selectedPaymentMethod === m.id
                            ? "border-primary bg-primary/10 text-primary font-black"
                            : "border-border bg-card text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <p className="text-xs font-extrabold">{m.label}</p>
                        <p className="text-[10px] opacity-75">{m.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleConfirmPurchase}
                  disabled={isProcessingCheckout}
                  className="w-full text-sm font-black py-3"
                >
                  {isProcessingCheckout ? (
                    "Processing Mock Payment..."
                  ) : (
                    `Confirm & Pay ₹${
                      selectedPlanForCheckout.tier === "annual_pass"
                        ? selectedPlanForCheckout.annualPrice
                        : billingCycle === "annual"
                          ? selectedPlanForCheckout.annualPrice
                          : selectedPlanForCheckout.price
                    }`
                  )}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground">
                  🔒 Mock payment adapter. No actual credit card or real bank transaction is charged.
                </p>
              </div>
            ) : (
              /* Success / Membership Pass Activated Screen */
              <div className="text-center py-4 space-y-4">
                <div className="size-16 rounded-full bg-emerald-500/20 text-emerald-500 grid place-items-center mx-auto">
                  <CheckCircle2 className="size-10" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-black text-foreground">
                    MEMBERSHIP ACTIVE!
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Welcome to <strong>{selectedPlanForCheckout.name}</strong>. Your discounts, TurfPoints multiplier, and VIP booking perks are active immediately.
                  </p>
                </div>

                {/* Digital Card Preview */}
                <div className="rounded-2xl p-5 text-left bg-gradient-to-r from-slate-900 to-slate-950 text-white border border-primary/40 shadow-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-display font-black text-lg tracking-wider text-primary">
                      PLAYO PASS
                    </span>
                    <Badge tone="gold">VIP ACTIVE</Badge>
                  </div>
                  <div>
                    <p className="text-xs opacity-60 uppercase font-mono">Member Name</p>
                    <p className="font-extrabold text-sm">{user?.name ?? "Ayush Sharma"}</p>
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-white/10">
                    <div>
                      <p className="opacity-60 text-[10px]">Tier</p>
                      <p className="font-bold text-primary">{selectedPlanForCheckout.name}</p>
                    </div>
                    <div>
                      <p className="opacity-60 text-[10px]">Discount</p>
                      <p className="font-bold text-success">{selectedPlanForCheckout.discountPercent}% Off All Turfs</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => setSelectedPlanForCheckout(null)}
                  >
                    Close
                  </Button>
                  <Button
                    className="flex-1 text-xs font-black"
                    onClick={() => {
                      setSelectedPlanForCheckout(null);
                    }}
                  >
                    <Link to="/explore">Book Turf Now</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

