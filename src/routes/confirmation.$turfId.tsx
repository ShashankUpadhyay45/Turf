import { createFileRoute, notFound } from '@tanstack/react-router';
import { CalendarDays, Check, Download, Gift, Navigation } from 'lucide-react';
import { ActionLink } from '@/components/ui';
import { DigitalTicket } from '@/components/DigitalTicket';
import { turfs } from '@/data/turfs';
import { useAppStore } from '@/store/useAppStore';
import { useBookingStore } from '@/store/useBookingStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useMemo } from 'react';

export const Route = createFileRoute('/confirmation/$turfId')({
  loader: ({ params }) => {
    const t = turfs.find((x) => x.id === params.turfId);
    if (!t) throw notFound();
    return t;
  },
  head: () => ({
    meta: [
      { title: 'Booking Confirmed — Digital Ticket Pass — Playo' },
      { name: 'description', content: 'Your Playo match booking is confirmed. View your digital ticket and directions.' },
    ],
  }),
  component: Confirmation,
});

function Confirmation() {
  const turf = Route.useLoaderData();
  const date = useAppStore((s) => s.selectedDate);
  const slot = useAppStore((s) => s.selectedSlot);
  const user = useAuthStore((s) => s.user);
  const bookings = useBookingStore((s) => s.bookings);

  // Find the latest booking for this turf
  const latestBooking = useMemo(() => {
    return bookings.find((b) => b.turfId === turf.id && b.userId === user?.id);
  }, [bookings, turf.id, user?.id]);

  const displayDate = date
    ? new Date(date).toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : latestBooking?.date ?? 'Today';

  const displaySlot = slot || latestBooking?.startTime || '07:00 PM';
  const bookingId = latestBooking?.id ?? `TB-2026-${Date.now().toString(36).substring(2, 8).toUpperCase()}`;
  const earnedPoints = latestBooking?.rewardPointsEarned ?? 100;
  const finalAmount = latestBooking?.finalPrice ?? turf.pricePerHour;
  const basePrice = latestBooking?.basePrice ?? turf.pricePerHour;
  const membershipDiscount = latestBooking?.membershipDiscount ?? 0;
  const rewardDiscount = latestBooking?.rewardDiscount ?? 0;

  return (
    <div className="container-page py-12">
      <div className="max-w-2xl mx-auto text-center mb-8">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-action">
          <Check className="size-8 stroke-[3]" />
        </div>
        <p className="eyebrow mt-4">Match Reserved & Confirmed</p>
        <h1 className="font-display text-5xl font-black text-foreground">
          YOUR MATCH PASS IS READY.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Confirmation sent via Email & WhatsApp. Present your digital ticket at the ground.
        </p>
      </div>

      {/* Official Digital Ticket Component */}
      <DigitalTicket
        bookingId={bookingId}
        turfName={turf.name}
        turfAddress={turf.address}
        turfImage={turf.image}
        sport={latestBooking?.sport ?? turf.sports[0] ?? 'Football'}
        date={displayDate}
        startTime={displaySlot}
        finalAmount={finalAmount}
        basePrice={basePrice}
        membershipDiscount={membershipDiscount}
        rewardDiscount={rewardDiscount}
        rewardPointsEarned={earnedPoints}
        latitude={turf.latitude}
        longitude={turf.longitude}
        userEmail={user?.email ?? 'ayush@example.com'}
        userPhone={user?.phone ?? '+91 98765 43210'}
        emailStatus="sent"
        whatsAppStatus="sent"
        cancellationPolicy={turf.cancellationPolicy}
      />

      <div className="mt-8 flex justify-center gap-3">
        <ActionLink to="/bookings" variant="dark">
          View All Bookings
        </ActionLink>
        <ActionLink to="/explore" variant="secondary">
          Find More Turfs
        </ActionLink>
      </div>
    </div>
  );
}
