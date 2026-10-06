import { Link, useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  ChevronRight,
  Gift,
  Heart,
  MapPin,
  Star,
  UserRound,
  Navigation,
  XCircle,
  CheckCircle2,
  Copy,
  Check,
  Crown,
  AlertCircle,
  Briefcase,
  Shield,
  Sparkles,
  Layers,
} from "lucide-react";
import { useState, useMemo } from "react";
import { TurfCard } from "@/components/TurfCard";
import { ActionLink, Badge, Button, SectionHeading } from "@/components/ui";
import { turfs } from "@/data/turfs";
import { redemptionOptions, getMembershipPlan } from "@/data/membership";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useBookingStore } from "@/store/useBookingStore";
import { useRewardStore } from "@/store/useRewardStore";
import { useAvailabilityStore } from "@/store/useAvailabilityStore";

/* =========================================================================
   REWARDS PAGE & REDEMPTION SYSTEM
   ========================================================================= */
export function RewardsPage() {
  const user = useAuthStore((s) => s.user);
  const addRewardPoints = useAuthStore((s) => s.addRewardPoints);
  const deductRewardPoints = useAuthStore((s) => s.deductRewardPoints);
  const transactions = useRewardStore((s) => s.transactions);
  const addTransaction = useRewardStore((s) => s.addTransaction);
  const activeRedemptions = useRewardStore((s) => s.activeRedemptions);
  const addRedemption = useRewardStore((s) => s.addRedemption);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const points = user?.rewardPoints ?? 2450;
  const userTransactions = useMemo(() => {
    if (!user) return transactions;
    return transactions.filter((t) => t.userId === user.id || t.userId === "user-1");
  }, [transactions, user]);

  const handleRedeem = (option: (typeof redemptionOptions)[0]) => {
    setRedeemError(null);
    setRedeemSuccess(null);

    if (points < option.pointsCost) {
      setRedeemError(
        `Insufficient TurfPoints. You need ${option.pointsCost - points} more points to redeem ${option.title}.`
      );
      return;
    }

    // Deduct points
    const success = deductRewardPoints(option.pointsCost);
    if (!success) {
      setRedeemError("Could not deduct points. Please verify your balance.");
      return;
    }

    // Add transaction to ledger
    addTransaction({
      userId: user?.id ?? "user-1",
      type: "redeemed",
      points: -option.pointsCost,
      description: `${option.title} voucher generated`,
    });

    // Generate active redemption voucher
    const voucher = addRedemption({
      title: option.title,
      discountValue: option.discountValue,
      discountType: option.discountType,
    });

    setRedeemSuccess(
      `Congratulations! You redeemed "${option.title}". Use coupon code ${voucher.code} at checkout!`
    );
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="container-page py-12">
      <SectionHeading
        eyebrow="TurfPoints Loyalty Ledger"
        title="YOUR PLAY PAYS BACK."
        body="Earn 100+ points on every completed booking. Redeem points for instant discounts and free slot upgrades."
      />

      {/* Feedback Messages */}
      {redeemSuccess && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-success/40 bg-success-soft p-4 text-success animate-in fade-in">
          <CheckCircle2 className="size-5 shrink-0" />
          <p className="text-sm font-bold">{redeemSuccess}</p>
        </div>
      )}

      {redeemError && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-destructive animate-in fade-in">
          <AlertCircle className="size-5 shrink-0" />
          <p className="text-sm font-bold">{redeemError}</p>
        </div>
      )}

      {/* Balance & Next Milestone */}
      <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-xl bg-foreground p-8 text-background shadow-lg">
          <p className="text-xs uppercase font-extrabold tracking-wider text-background/60">
            Available Balance
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <p className="font-display text-7xl font-black text-primary">
              {points.toLocaleString()}
            </p>
            <span className="font-display text-2xl font-bold text-background/70">
              POINTS
            </span>
          </div>
          <p className="mt-2 text-xs text-background/70">
            Earned from verified matches, membership bonuses, and promotions.
          </p>

          <div className="mt-8">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span>Next Milestone: ₹200 OFF</span>
              <span>3,000 Points Goal</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-background/20">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(100, (points / 3000) * 100)}%` }}
              />
            </div>
          </div>
        </section>

        <section className="card-shell p-6 flex flex-col justify-between">
          <div>
            <Badge tone="gold">
              <Gift className="size-3" />
              Member Perk
            </Badge>
            <h3 className="mt-4 font-display text-3xl font-black">
              INSTANT CHECKOUT
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-6">
              You can apply TurfPoints directly on the payment screen to deduct
              cash from your ground booking fee.
            </p>
          </div>
          <ActionLink to="/explore" className="mt-6 w-full">
            Book Turf & Earn Points
          </ActionLink>
        </section>
      </div>

      {/* Active Vouchers */}
      {activeRedemptions.length > 0 && (
        <section className="mt-12">
          <SectionHeading
            eyebrow="My Rewards"
            title="Active Vouchers"
            body="Use these coupon codes during checkout for instant savings."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeRedemptions.map((voucher) => (
              <div
                key={voucher.id}
                className="card-shell p-5 border-dashed border-2 border-primary/40 bg-secondary/30 relative"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Badge tone="green">ACTIVE</Badge>
                    <h4 className="mt-2 font-display text-xl font-black">
                      {voucher.title}
                    </h4>
                  </div>
                  <Gift className="size-5 text-reward" />
                </div>
                <div className="mt-4 flex items-center justify-between rounded-md bg-card p-2.5 border border-border">
                  <span className="font-mono text-xs font-black tracking-wider text-foreground">
                    {voucher.code}
                  </span>
                  <button
                    onClick={() => handleCopy(voucher.code)}
                    className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-[11px] font-bold hover:bg-muted/80 transition"
                  >
                    {copiedCode === voucher.code ? (
                      <>
                        <Check className="size-3 text-success" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Point Redemption Catalog */}
      <section className="mt-12">
        <SectionHeading
          eyebrow="Rewards Store"
          title="Redeem Your Points"
          body="Convert your loyalty balance into discounts for your next match."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {redemptionOptions.map((opt) => {
            const canAfford = points >= opt.pointsCost;
            return (
              <article
                key={opt.id}
                className="card-shell p-6 flex flex-col justify-between border hover:border-primary transition"
              >
                <div>
                  <div className="flex justify-between items-center">
                    <span className="font-display text-2xl font-black text-foreground">
                      {opt.title}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground leading-5">
                    {opt.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-xs font-bold text-muted-foreground">
                      Cost
                    </span>
                    <span className="font-display text-2xl font-black text-reward">
                      {opt.pointsCost}{" "}
                      <span className="text-xs font-sans">Points</span>
                    </span>
                  </div>

                  <Button
                    onClick={() => handleRedeem(opt)}
                    disabled={!canAfford}
                    variant={canAfford ? "primary" : "secondary"}
                    className="w-full text-xs"
                  >
                    {canAfford ? "Redeem Now" : "Need More Points"}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Transaction History Ledger */}
      <section className="mt-14">
        <SectionHeading
          eyebrow="Audit Ledger"
          title="Points Activity History"
          body="Every earned point, promotional bonus, and redeemed discount is recorded here."
        />
        <div className="card-shell overflow-hidden divide-y divide-border">
          {userTransactions.length > 0 ? (
            userTransactions.map((tx) => {
              const isEarned = tx.points > 0;
              const dateStr = new Date(tx.createdAt).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }
              );
              return (
                <div
                  key={tx.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 p-5 hover:bg-muted/40 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-bold text-foreground">
                        {tx.description}
                      </strong>
                      <Badge
                        tone={
                          tx.type === "earned"
                            ? "green"
                            : tx.type === "bonus"
                              ? "gold"
                              : "neutral"
                        }
                      >
                        {tx.type.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {dateStr} {tx.bookingId && `· Ref #${tx.bookingId}`}
                    </p>
                  </div>
                  <strong
                    className={`font-display text-2xl font-black ${
                      isEarned ? "text-success" : "text-reward"
                    }`}
                  >
                    {isEarned ? `+${tx.points}` : tx.points}
                  </strong>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No transactions recorded yet. Book a turf to earn your first points!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* =========================================================================
   MY BOOKINGS PAGE (LIVE BOOKINGS, DIRECTIONS, CANCELLATION)
   ========================================================================= */
export function BookingsPage() {
  const user = useAuthStore((s) => s.user);
  const bookings = useBookingStore((s) => s.bookings);
  const cancelBooking = useBookingStore((s) => s.cancelBooking);
  const unblockSlot = useAvailabilityStore((s) => s.unblockSlot);

  const [activeTab, setActiveTab] = useState<
    "all" | "confirmed" | "completed" | "cancelled"
  >("all");
  const [cancelFeedback, setCancelFeedback] = useState<string | null>(null);

  // Filter bookings for current user
  const userBookings = useMemo(() => {
    const list = user ? bookings.filter((b) => b.userId === user.id) : bookings;
    if (activeTab === "all") return list;
    return list.filter((b) => b.status === activeTab);
  }, [bookings, user, activeTab]);

  const handleCancel = (bookingId: string, turfId: string, date: string, startTime: string) => {
    const success = cancelBooking(bookingId);
    if (success) {
      // Free up the slot in availability store
      unblockSlot(turfId, date, startTime);
      setCancelFeedback(
        `Booking #${bookingId} has been successfully cancelled. The time slot is now available again.`
      );
      setTimeout(() => setCancelFeedback(null), 4000);
    }
  };

  return (
    <div className="container-page py-12">
      <SectionHeading
        eyebrow="Match Calendar"
        title="MY BOOKINGS"
        body="Review your confirmed games, get live Google Maps directions to the venue, and view match details."
      />

      {cancelFeedback && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-info/40 bg-info-soft p-4 text-info animate-in fade-in">
          <CheckCircle2 className="size-5 shrink-0" />
          <p className="text-sm font-bold">{cancelFeedback}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border mb-6">
        {[
          { key: "all", label: "All Bookings" },
          { key: "confirmed", label: "Upcoming" },
          { key: "completed", label: "Completed" },
          { key: "cancelled", label: "Cancelled" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-3 text-sm font-bold transition border-b-2 ${
              activeTab === tab.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {userBookings.length > 0 ? (
          userBookings.map((b) => {
            const turf = turfs.find((t) => t.id === b.turfId);
            const image = turf?.image ?? b.turfImage;
            const address = turf?.address ?? `${b.turfArea}, Dehradun`;
            const directionsUrl = turf
              ? `https://www.google.com/maps/dir/?api=1&destination=${turf.latitude},${turf.longitude}&travelmode=driving`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  b.turfName + " " + b.turfArea
                )}`;

            const isUpcoming = b.status === "confirmed";

            return (
              <article
                key={b.id}
                className="card-shell overflow-hidden grid md:grid-cols-[240px_1fr_auto] items-center gap-5 p-5"
              >
                <div className="relative aspect-[16/10] md:h-full w-full overflow-hidden rounded-lg">
                  <img
                    src={image}
                    alt={b.turfName}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge tone="blue">{b.sport.toUpperCase()}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge
                      tone={
                        b.status === "confirmed"
                          ? "green"
                          : b.status === "completed"
                            ? "blue"
                            : "neutral"
                      }
                    >
                      {b.status.toUpperCase()}
                    </Badge>
                    <span className="font-mono text-xs text-muted-foreground">
                      #{b.id}
                    </span>
                  </div>

                  <h3 className="font-display text-3xl font-extrabold text-foreground">
                    {b.turfName}
                  </h3>

                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1.5 text-foreground">
                      <CalendarDays className="size-4 text-info" />
                      {b.date} · {b.startTime}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-4 text-info" />
                      {address}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold pt-1">
                    <span>
                      Paid:{" "}
                      <strong className="text-foreground text-sm">
                        ₹{b.finalPrice}
                      </strong>
                    </span>
                    <span className="text-reward">
                      +{b.rewardPointsEarned} TP Earned
                    </span>
                    <span className="text-muted-foreground">
                      Via {b.paymentMethod}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-44">
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
                  >
                    <Navigation className="size-3.5" />
                    Get Directions
                  </a>

                  <Link
                    to="/turfs/$turfId"
                    params={{ turfId: b.turfId }}
                    className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-card px-4 text-xs font-bold hover:bg-muted transition text-center"
                  >
                    Turf Details
                  </Link>

                  {isUpcoming && (
                    <button
                      onClick={() =>
                        handleCancel(b.id, b.turfId, b.date, b.startTime)
                      }
                      className="inline-flex min-h-9 items-center justify-center gap-1 rounded-md text-xs font-bold text-destructive hover:bg-destructive/10 transition"
                    >
                      <XCircle className="size-3.5" />
                      Cancel Booking
                    </button>
                  )}
                </div>
              </article>
            );
          })
        ) : (
          <Empty
            icon={CalendarDays}
            title="No bookings found"
            body="You have no matches scheduled in this category. Ready to play?"
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   USER PROFILE PAGE (PERSONA SWITCHER, MEMBERSHIP & DETAILS)
   ========================================================================= */
export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const toggleAutoRenew = useAuthStore((s) => s.toggleAutoRenew);
  const plan = getMembershipPlan(user?.membershipTier ?? "free");
  const isAnnualPass = user?.membershipTier === "annual_pass";
  const isPro = user?.membershipTier === "pro";
  const hasPaidPlan = user?.membershipTier && user.membershipTier !== "free";

  return (
    <div className="container-page py-12">
      <SectionHeading eyebrow="Account Management" title="YOUR PROFILE" />

      {/* Digital Membership Pass & Benefits Card */}
      <div className={`mb-8 rounded-2xl border p-6 shadow-xl transition-all ${
        isAnnualPass
          ? "border-amber-400 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 text-white ring-1 ring-amber-400/50"
          : isPro
            ? "border-primary bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 text-white ring-1 ring-primary/40"
            : "border-border bg-card"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-black uppercase tracking-wider ${
                isAnnualPass
                  ? "bg-amber-500 text-black"
                  : isPro
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              }`}>
                <Crown className="size-3.5" />
                {plan.name}
              </span>
              {hasPaidPlan && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active Membership
                </span>
              )}
            </div>

            <h3 className="font-display text-3xl font-black">
              {isAnnualPass ? "ALL-ACCESS ANNUAL PASS" : `${plan.name.toUpperCase()} MEMBERSHIP`}
            </h3>

            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              {plan.tagline ?? "Enjoy exclusive platform discounts, reward multipliers, and priority booking windows."}
            </p>

            {hasPaidPlan && (
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Expires: </span>
                  <strong className="text-foreground">
                    {user?.membershipDetails?.expiryDate 
                      ? new Date(user.membershipDetails.expiryDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
                      : "1 Year Active"}
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Discount: </span>
                  <strong className="text-emerald-500">{plan.discountPercent}% Off All Turfs</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Points Multiplier: </span>
                  <strong className="text-primary">{plan.rewardMultiplier}x</strong>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {hasPaidPlan && (
              <button
                type="button"
                onClick={toggleAutoRenew}
                className="rounded-lg border border-border/80 bg-background/50 px-3.5 py-2 text-xs font-bold hover:bg-background transition text-left"
              >
                <span className="text-[10px] text-muted-foreground block">Auto-Renewal</span>
                <span className={user?.membershipDetails?.autoRenew !== false ? "text-emerald-500 font-extrabold" : "text-destructive font-extrabold"}>
                  {user?.membershipDetails?.autoRenew !== false ? "Enabled" : "Disabled"}
                </span>
              </button>
            )}

            <ActionLink to="/membership" variant={isAnnualPass ? "primary" : isPro ? "primary" : "secondary"}>
              {hasPaidPlan ? "Upgrade / Change Plan" : "Explore Plans & Annual Pass"}
            </ActionLink>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* User Card */}
        <aside className="card-shell p-6 text-center space-y-4">
          <div className="mx-auto grid size-24 place-items-center rounded-full bg-secondary">
            <UserRound className="size-12 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-3xl font-black">
              {user?.name ?? "Ayush Player"}
            </h2>
            <p className="text-xs text-muted-foreground">{user?.email ?? "ayush@example.com"}</p>
          </div>

          <div className="flex justify-center gap-2">
            <Badge
              tone={
                user?.role === "admin"
                  ? "gold"
                  : user?.role === "owner"
                    ? "blue"
                    : "green"
              }
            >
              {user?.role ? user.role.toUpperCase() : "PLAYER"}
            </Badge>
            <span className="rounded-full bg-reward-soft px-3 py-1 text-xs font-black text-reward">
              {user?.rewardPoints ?? 2450} TP
            </span>
          </div>

          <div className="border-t border-border pt-4 text-left text-xs space-y-2 text-muted-foreground">
            <p>
              <strong className="text-foreground">Phone:</strong> {user?.phone ?? "+91 98765 43210"}
            </p>
            <p>
              <strong className="text-foreground">Member Since:</strong> January 2026
            </p>
            <p>
              <strong className="text-foreground">Verified ID:</strong> Yes
            </p>
          </div>

          <Button
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            variant="secondary"
            className="w-full text-xs text-destructive hover:bg-destructive/10"
          >
            Sign Out
          </Button>
        </aside>

        {/* Dashboard Cards */}
        <div className="space-y-6">
          {/* Membership Tier Banner */}
          <div className="card-shell p-6 bg-gradient-to-r from-card to-secondary/30">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Badge tone="green">
                  <Crown className="size-3" />
                  MEMBERSHIP
                </Badge>
                <h3 className="mt-2 font-display text-4xl font-black">
                  {plan.name.toUpperCase()} TIER
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Enjoy {plan.discountPercent}% booking discount and {plan.rewardMultiplier}x TurfPoints reward multiplier.
                </p>
              </div>
              <ActionLink to="/membership" variant="dark">
                {plan.tier === "pro" ? "View Benefits" : "Upgrade Plan"}
              </ActionLink>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <section className="card-shell divide-y divide-border">
            {[
              {
                icon: CalendarDays,
                title: "My Match Bookings",
                desc: "Check match tickets and Google Maps directions",
                to: "/bookings",
              },
              {
                icon: Gift,
                title: "TurfPoints Rewards",
                desc: "Redeem points for discounts and view ledger",
                to: "/rewards",
              },
              {
                icon: Heart,
                title: "Saved Venues",
                desc: "Your favorite cricket and football turfs",
                to: "/favorites",
              },
              {
                icon: Crown,
                title: "Membership Tiers",
                desc: "Unlock priority booking and higher discounts",
                to: "/membership",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  to={item.to}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-5 hover:bg-muted/40 transition"
                >
                  <Icon className="size-5 text-info" />
                  <div>
                    <strong className="text-sm font-bold text-foreground">
                      {item.title}
                    </strong>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              );
            })}
          </section>

          {/* Owner / Admin Shortcut if applicable */}
          {user?.role === "owner" && (
            <div className="card-shell p-6 border-info/40 bg-info-soft/30 flex items-center justify-between">
              <div>
                <Badge tone="blue">TURF OWNER</Badge>
                <h4 className="mt-1 font-display text-2xl font-black">
                  OWNER DASHBOARD & SLOTS
                </h4>
                <p className="text-xs text-muted-foreground">
                  Block/unblock slots, mark maintenance, and track revenue.
                </p>
              </div>
              <ActionLink to="/owner" variant="primary">
                Open Portal
              </ActionLink>
            </div>
          )}

          {user?.role === "admin" && (
            <div className="card-shell p-6 border-destructive/40 bg-destructive/10 flex items-center justify-between">
              <div>
                <Badge tone="gold">SUPER ADMIN</Badge>
                <h4 className="mt-1 font-display text-2xl font-black">
                  ADMIN CONSOLE
                </h4>
                <p className="text-xs text-muted-foreground">
                  Manage users, turfs, sports, and platform bookings.
                </p>
              </div>
              <ActionLink to="/admin" variant="dark">
                Admin Console
              </ActionLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   FAVORITES PAGE
   ========================================================================= */
export function FavoritesPage() {
  const fav = useAppStore((s) => s.favorites);
  const list = turfs.filter((t) => fav.includes(t.id));

  return (
    <div className="container-page py-12">
      <SectionHeading
        eyebrow="Saved Grounds"
        title="YOUR FAVORITES"
        body="Keep your top playing venues pinned for fast and effortless re-booking."
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => (
          <TurfCard key={t.id} turf={t} />
        ))}
      </div>
      {!list.length && (
        <Empty
          icon={Heart}
          title="No saved turfs"
          body="Tap the heart icon on any turf to pin it here for quick access."
        />
      )}
    </div>
  );
}

/* =========================================================================
   EMPTY STATE COMPONENT
   ========================================================================= */
export function Empty({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Heart;
  title: string;
  body: string;
}) {
  return (
    <div className="card-shell grid min-h-80 place-items-center p-8 text-center">
      <div>
        <Icon className="mx-auto size-12 text-info/70" />
        <h2 className="mt-4 font-display text-3xl font-extrabold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">{body}</p>
        <ActionLink to="/explore" className="mt-6">
          Find a Turf
        </ActionLink>
      </div>
    </div>
  );
}
