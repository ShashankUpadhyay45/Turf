import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo } from 'react';
import {
  CalendarCheck,
  IndianRupee,
  Clock3,
  Layers,
  Users,
  BarChart3,
  Sparkles,
  Bot,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { ActionLink, Badge, SectionHeading } from '@/components/ui';
import { useAuthStore } from '@/store/useAuthStore';
import { useOwnerStore } from '@/store/useOwnerStore';
import { useBookingStore } from '@/store/useBookingStore';
import { useAvailabilityStore } from '@/store/useAvailabilityStore';
import { AccuracyScoreCard } from '@/features/accuracy/AccuracyScoreCard';
import { AvailabilityManager } from '@/features/availability/AvailabilityManager';
import { ResubmitBanner } from '@/features/approval/ResubmitBanner';
import { ListingStatusBadge } from '@/features/approval/ListingStatusBadge';
import { VerificationBadge } from '@/features/verification/VerificationBadges';

export const Route = createFileRoute('/owner/')({
  head: () => ({
    meta: [
      { title: 'Owner Dashboard — Playo' },
      { name: 'description', content: 'Manage turf bookings, revenue, accuracy, and availability.' },
    ],
  }),
  component: OwnerDashboardPage,
});

function OwnerDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const ownerId = user?.id ?? 'owner-1';

  const allTurfs = useOwnerStore((s) => s.turfs);
  const getOwnerAccuracy = useOwnerStore((s) => s.getOwnerAccuracy);
  const allBookings = useBookingStore((s) => s.bookings);
  const getSlots = useAvailabilityStore((s) => s.getSlots);

  // Strictly isolated owner's turfs
  const myTurfs = useMemo(() => allTurfs.filter((t) => t.ownerId === ownerId), [allTurfs, ownerId]);
  const primaryTurf = myTurfs[0];
  const accuracy = useMemo(() => getOwnerAccuracy(ownerId), [getOwnerAccuracy, ownerId]);
  const bookings = useMemo(() => allBookings.filter((b) => b.ownerId === ownerId), [allBookings, ownerId]);

  const todayIso = new Date().toISOString().split('T')[0]!;
  const todaySlots = useMemo(() => {
    if (!primaryTurf) return [];
    return getSlots(primaryTurf.id, todayIso);
  }, [getSlots, primaryTurf, todayIso]);

  const availableSlotsCount = todaySlots.filter((s) => s.status === 'available').length;
  const bookedSlotsCount = todaySlots.filter((s) => s.status === 'booked').length;
  const maintenanceSlotsCount = todaySlots.filter((s) => s.status === 'maintenance').length;
  const pendingTurfs = myTurfs.filter((t) => t.approvalStatus !== 'APPROVED');

  const stats = [
    {
      icon: Layers,
      label: 'Listed Venues',
      value: `${myTurfs.length} Turfs`,
      desc: `${pendingTurfs.length} pending review`,
      tone: 'info',
    },
    {
      icon: CalendarCheck,
      label: "Today's Bookings",
      value: `${bookedSlotsCount + 3}`,
      desc: 'Live & confirmed matches',
      tone: 'success',
    },
    {
      icon: Clock3,
      label: 'Available Slots',
      value: `${availableSlotsCount}`,
      desc: `Of ${todaySlots.length || 13} slots today`,
      tone: 'info',
    },
    {
      icon: Users,
      label: 'Occupancy Rate',
      value: '79.4%',
      desc: '+6% vs last week',
      tone: 'gold',
    },
    {
      icon: IndianRupee,
      label: 'Monthly Revenue',
      value: '₹1,48,500',
      desc: '+18.2% vs previous period',
      tone: 'success',
    },
  ];

  return (
    <div className="container-page py-10 space-y-8">
      {/* Welcome & Fast Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Owner Workspace</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black">
            WELCOME, {user?.name?.toUpperCase() ?? 'CHAMPIONS SPORTS'}.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your sports grounds, real-time availability, bookings, and platform compliance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ActionLink to="/owner/ai-assistant" variant="secondary" className="text-xs">
            <Bot className="size-4 mr-1 text-primary" />
            AI Assistant
          </ActionLink>
          <ActionLink to="/owner/availability" variant="primary" className="text-xs">
            <Layers className="size-4 mr-1" />
            Manage Availability
          </ActionLink>
          <ActionLink to="/owner/add-turf" variant="dark" className="text-xs">
            + Add New Turf
          </ActionLink>
        </div>
      </div>

      {/* Resubmit Banner if any listing needs fixes */}
      {myTurfs
        .filter((t) => t.approvalStatus === 'CHANGES_REQUESTED' || t.approvalStatus === 'REJECTED')
        .map((t) => (
          <ResubmitBanner
            key={t.id}
            status={t.approvalStatus}
            turfId={t.id}
            rejectionReason={t.rejectionReason}
            changesRequestedNote={t.changesRequestedNote}
          />
        ))}

      {/* Primary KPI Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <article key={s.label} className="card-shell p-4 hover:border-primary/50 transition">
              <Icon className="size-5 text-info" />
              <p className="mt-3 text-xs text-muted-foreground font-bold">{s.label}</p>
              <p className="font-display text-3xl font-extrabold">{s.value}</p>
              <p className="text-[11px] font-bold text-success mt-1">{s.desc}</p>
            </article>
          );
        })}
      </div>

      {/* Availability Accuracy & Negative Marking Card */}
      <AccuracyScoreCard accuracy={accuracy} />

      {/* Owner Venues Quick Overview */}
      <section>
        <SectionHeading
          eyebrow="Portfolio"
          title="MY SPORTS VENUES"
          action={
            <Link to="/owner/turfs" className="text-sm font-bold text-primary hover:underline">
              View all ({myTurfs.length}) →
            </Link>
          }
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myTurfs.map((t) => (
            <div key={t.id} className="card-shell overflow-hidden hover:border-primary/50 transition">
              <div className="relative aspect-[16/9] w-full">
                <img src={t.image} alt={t.name} className="h-full w-full object-cover" />
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                  <ListingStatusBadge status={t.approvalStatus} />
                  <VerificationBadge status={t.verificationStatus} />
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-display text-xl font-bold">{t.name}</h3>
                  <span className="font-extrabold text-sm">₹{t.pricePerHour}/hr</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.area}, {t.city} · {t.sports.join(', ')}
                </p>
                <div className="pt-2 flex justify-between items-center border-t border-border text-xs">
                  <Link
                    to={`/owner/turfs/${t.id}/edit`}
                    className="font-bold text-primary hover:underline"
                  >
                    Edit Venue
                  </Link>
                  <Link
                    to="/owner/availability"
                    className="font-bold text-muted-foreground hover:text-foreground"
                  >
                    Configure Slots →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Availability Quick Manager */}
      <section>
        <AvailabilityManager initialTurfId={primaryTurf?.id} />
      </section>

      {/* Upcoming Player Bookings */}
      <section>
        <SectionHeading
          eyebrow="Schedule"
          title="TODAY'S PLAYER RESERVATIONS"
          action={
            <Link to="/owner/bookings" className="text-sm font-bold text-primary hover:underline">
              View all bookings →
            </Link>
          }
        />
        <div className="card-shell divide-y divide-border overflow-x-auto">
          {bookings.length > 0 ? (
            bookings.slice(0, 5).map((b) => (
              <div
                key={b.id}
                className="grid grid-cols-[120px_1fr_auto_auto] items-center gap-4 p-4 text-sm min-w-[600px]"
              >
                <strong className="text-foreground font-mono">{b.startTime}</strong>
                <div>
                  <p className="font-bold text-foreground">{b.userName ?? 'Player'}</p>
                  <p className="text-xs text-muted-foreground">
                    Ref #{b.referenceCode} · {b.sport.toUpperCase()} · {b.turfName}
                  </p>
                </div>
                <strong className="font-display text-lg">₹{b.finalPrice}</strong>
                <Badge tone={b.status === 'confirmed' ? 'green' : 'neutral'}>
                  {b.status.toUpperCase()}
                </Badge>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No reservations recorded today.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
