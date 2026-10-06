import { createFileRoute, Link, notFound, useNavigate } from '@tanstack/react-router';
import { Check, ChevronLeft, CreditCard, LockKeyhole, ShieldCheck, Tag, AlertTriangle, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Badge, Button } from '@/components/ui';
import { turfs } from '@/data/turfs';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useAvailabilityStore } from '@/store/useAvailabilityStore';
import { useBookingStore } from '@/store/useBookingStore';
import { useRewardStore } from '@/store/useRewardStore';
import { getMembershipPlan } from '@/data/membership';
import { RouteGuard } from '@/components/RouteGuard';

export const Route = createFileRoute('/booking/$turfId')({
  loader: ({ params }) => {
    const t = turfs.find((x) => x.id === params.turfId);
    if (!t) throw notFound();
    return t;
  },
  head: () => ({
    meta: [
      { title: 'Complete Your Booking — Playo' },
      { name: 'description', content: 'Review your turf slot, apply rewards, and choose a payment method.' },
    ],
  }),
  component: BookingWrapper,
});

function BookingWrapper() {
  return (
    <RouteGuard allowedRoles={['player', 'admin']}>
      <Booking />
    </RouteGuard>
  );
}

function Booking() {
  const turf = Route.useLoaderData();
  const navigate = useNavigate();
  const date = useAppStore((s) => s.selectedDate);
  const slot = useAppStore((s) => s.selectedSlot);
  const reward = useAppStore((s) => s.rewardApplied);
  const rewardDiscount = useAppStore((s) => s.rewardDiscount);
  const toggle = useAppStore((s) => s.toggleReward);
  const resetBooking = useAppStore((s) => s.resetBookingState);
  const user = useAuthStore((s) => s.user);
  const addRewardPoints = useAuthStore((s) => s.addRewardPoints);
  const deductRewardPoints = useAuthStore((s) => s.deductRewardPoints);
  const isSlotAvailable = useAvailabilityStore((s) => s.isSlotAvailable);
  const bookSlotInStore = useAvailabilityStore((s) => s.bookSlot);
  const addBooking = useBookingStore((s) => s.addBooking);
  const addTransaction = useRewardStore((s) => s.addTransaction);

  const [method, setMethod] = useState('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const plan = useMemo(() => getMembershipPlan(user?.membershipTier ?? 'free'), [user?.membershipTier]);

  const base = turf.pricePerHour;
  const membershipDiscount = Math.round(base * (plan.discountPercent / 100));
  const rewardValue = reward ? rewardDiscount : 0;
  const finalAmount = Math.max(0, base - membershipDiscount - rewardValue);

  const baseRewardPoints = 100;
  const earnedPoints = Math.round(baseRewardPoints * plan.rewardMultiplier);

  const handlePay = async () => {
    if (!user || !date || !slot) return;
    setIsProcessing(true);
    setBookingError('');

    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 800));

    // Double-booking prevention: re-check availability
    const stillAvailable = isSlotAvailable(turf.id, date, slot);
    if (!stillAvailable) {
      setBookingError('This slot was just booked by another user. Please choose another available slot.');
      setIsProcessing(false);
      return;
    }

    const bookingId = `PL-${Date.now().toString(36).toUpperCase()}`;

    // Book the slot
    const booked = bookSlotInStore(turf.id, date, slot, bookingId);
    if (!booked) {
      setBookingError('Unable to book this slot. It may have been taken. Please try another slot.');
      setIsProcessing(false);
      return;
    }

    // Deduct reward points if applied
    if (reward && rewardValue > 0) {
      deductRewardPoints(rewardValue);
      addTransaction({
        userId: user.id,
        type: 'redeemed',
        points: -rewardValue,
        description: `₹${rewardValue} discount applied to booking`,
        bookingId,
      });
    }

    // Earn reward points
    addRewardPoints(earnedPoints);
    addTransaction({
      userId: user.id,
      type: 'earned',
      points: earnedPoints,
      description: `Booking completed — ${turf.name}`,
      bookingId,
    });

    // Record the booking with enterprise reference code and coordinates
    const refCode = `TB-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    addBooking({
      id: bookingId,
      referenceCode: refCode,
      turfId: turf.id,
      turfName: turf.name,
      turfAddress: turf.address,
      turfImage: turf.image,
      turfLatitude: turf.latitude,
      turfLongitude: turf.longitude,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone ?? '+91 98765 43210',
      ownerId: turf.ownerId,
      sport: (turf.sports[0] ?? 'football') as any,
      date,
      startTime: slot,
      endTime: slot,
      basePrice: base,
      membershipDiscount,
      rewardDiscount: rewardValue,
      finalPrice: finalAmount,
      status: 'confirmed',
      rewardPointsEarned: earnedPoints,
      createdAt: new Date().toISOString(),
      paymentMethod: method,
      paymentStatus: 'PAID',
      qrVerificationCode: `https://playo.in/verify/${refCode}`,
    });

    setIsProcessing(false);
    navigate({ to: '/confirmation/$turfId', params: { turfId: turf.id } });
  };

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <div className="container-page py-6 sm:py-8 max-w-full min-w-0 overflow-hidden">
      <Link
        to="/turfs/$turfId"
        params={{ turfId: turf.id }}
        className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-bold"
      >
        <ChevronLeft className="size-4" />Back to turf
      </Link>

      <div className="mx-auto mt-6 grid max-w-5xl gap-6 sm:gap-7 lg:grid-cols-[1fr_380px] w-full min-w-0">
        <section className="min-w-0">
          <p className="eyebrow">Secure checkout</p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">ONE STEP FROM KICKOFF.</h1>

          {bookingError && (
            <div className="mt-5 flex items-start gap-3 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-5 shrink-0" />
              <div>
                <strong>Booking conflict</strong>
                <p className="mt-1">{bookingError}</p>
              </div>
            </div>
          )}

          {/* Payment method */}
          <div className="card-shell mt-7 p-5">
            <h2 className="font-display text-2xl font-extrabold">Payment method</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {['UPI', 'Card', 'Net banking', 'Wallet'].map((m) => (
                <Button
                  variant="secondary"
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`flex min-h-14 items-center gap-3 rounded-md border px-4 text-left font-bold ${
                    method === m ? 'border-primary bg-secondary' : 'border-border'
                  }`}
                >
                  <CreditCard className="size-5 text-info" />
                  {m}
                  {method === m && <Check className="ml-auto size-4 text-success" />}
                </Button>
              ))}
            </div>
          </div>

          {/* Reward toggle */}
          <div className="card-shell mt-4 flex items-center justify-between gap-4 p-5">
            <div>
              <p className="flex items-center gap-2 font-bold">
                <Tag className="size-4 text-reward" />Use TurfPoints
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {user?.rewardPoints ?? 0} points available · save ₹{rewardDiscount}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={toggle}
              role="switch"
              aria-label="Use TurfPoints"
              aria-checked={reward}
              disabled={(user?.rewardPoints ?? 0) < rewardDiscount}
              className={`relative h-7 w-12 rounded-full transition ${
                reward ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-1 size-5 rounded-full bg-card transition ${
                  reward ? 'left-6' : 'left-1'
                }`}
              />
            </Button>
          </div>

          {/* Membership info */}
          {plan.discountPercent > 0 && (
            <div className="mt-4 rounded-md bg-success-soft p-4 text-sm">
              <strong className="text-success">{plan.name} member</strong>
              <span className="text-muted-foreground">
                {' '}— {plan.discountPercent}% discount + {plan.rewardMultiplier}x reward points applied
              </span>
            </div>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {(
              [
                [LockKeyhole, 'Encrypted payment'],
                [Check, 'Instant confirmation'],
                [ShieldCheck, 'Verified turf'],
              ] as const
            ).map(([Icon, t]) => (
              <div key={t} className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <Icon className="size-4 text-success" />
                {t}
              </div>
            ))}
          </div>
        </section>

        {/* Order summary sidebar */}
        <aside className="card-shell p-5">
          <img
            src={turf.image}
            alt={turf.name}
            width={1536}
            height={1024}
            className="aspect-[16/9] w-full rounded-md object-cover"
          />
          <div className="mt-4">
            <Badge tone="green">Verified</Badge>
            <h2 className="mt-2 font-display text-2xl font-extrabold">{turf.name}</h2>
            <p className="text-sm text-muted-foreground">
              {formattedDate} · {slot}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{turf.area}, {turf.city}</p>
          </div>

          {/* Price breakdown */}
          <div className="mt-6 grid gap-3 border-t border-border pt-5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base price</span>
              <strong>₹{base}</strong>
            </div>
            {membershipDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{plan.name} discount ({plan.discountPercent}%)</span>
                <strong className="text-success">− ₹{membershipDiscount}</strong>
              </div>
            )}
            {reward && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">TurfPoints</span>
                <strong className="text-reward">− ₹{rewardValue}</strong>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-3 text-lg">
              <strong>Final amount</strong>
              <strong>₹{finalAmount}</strong>
            </div>
            <div className="rounded-md bg-reward-soft p-3 text-xs">
              <strong className="text-reward">+{earnedPoints} TurfPoints</strong>
              <span className="text-muted-foreground"> earned after booking</span>
            </div>
          </div>

          <Button className="mt-5 w-full" disabled={isProcessing || !date || !slot} onClick={handlePay}>
            {isProcessing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Processing…
              </>
            ) : (
              `Pay ₹${finalAmount}`
            )}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Your booking is confirmed only after successful payment.
          </p>
        </aside>
      </div>
    </div>
  );
}
