import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { Plus, MapPin, Clock, Edit, Layers, Trash2, AlertCircle } from 'lucide-react';
import { ActionLink, Badge, Button, SectionHeading } from '@/components/ui';
import { useAuthStore } from '@/store/useAuthStore';
import { useOwnerStore } from '@/store/useOwnerStore';
import { ListingStatusBadge } from '@/features/approval/ListingStatusBadge';
import { VerificationBadge } from '@/features/verification/VerificationBadges';
import type { ListingApprovalStatus } from '@/types';

export const Route = createFileRoute('/owner/turfs')({
  head: () => ({
    meta: [
      { title: 'My Venues — Playo Owner' },
      { name: 'description', content: 'Manage your sports grounds, pricing, and approval statuses.' },
    ],
  }),
  component: OwnerTurfsPage,
});

function OwnerTurfsPage() {
  const user = useAuthStore((s) => s.user);
  const ownerId = user?.id ?? 'owner-1';
  const turfs = useOwnerStore((s) => s.turfs);
  const deleteTurf = useOwnerStore((s) => s.deleteTurf);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const myTurfs = useMemo(() => turfs.filter((t) => t.ownerId === ownerId), [turfs, ownerId]);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return myTurfs;
    return myTurfs.filter((t) => t.approvalStatus === statusFilter);
  }, [myTurfs, statusFilter]);

  return (
    <div className="container-page py-10 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Venue Management</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black">MY SPORTS VENUES</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View, edit, and configure all grounds owned by {user?.name ?? 'your account'}.
          </p>
        </div>
        <ActionLink to="/owner/add-turf" variant="primary">
          <Plus className="size-4 mr-1" />
          Add New Venue
        </ActionLink>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {[
          { id: 'all', label: `All (${myTurfs.length})` },
          {
            id: 'APPROVED',
            label: `Published (${myTurfs.filter((t) => t.approvalStatus === 'APPROVED').length})`,
          },
          {
            id: 'PENDING_REVIEW',
            label: `Pending (${myTurfs.filter((t) => t.approvalStatus === 'PENDING_REVIEW').length})`,
          },
          {
            id: 'CHANGES_REQUESTED',
            label: `Changes Needed (${myTurfs.filter((t) => t.approvalStatus === 'CHANGES_REQUESTED').length})`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              statusFilter === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Venues Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((turf) => (
          <div key={turf.id} className="card-shell overflow-hidden flex flex-col justify-between">
            <div>
              <div className="relative aspect-[16/9] w-full">
                <img src={turf.image} alt={turf.name} className="h-full w-full object-cover" />
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                  <ListingStatusBadge status={turf.approvalStatus} />
                  <VerificationBadge status={turf.verificationStatus} />
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-display text-2xl font-black">{turf.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3" /> {turf.area}, {turf.city}
                    </p>
                  </div>
                  <span className="font-display text-lg font-black">₹{turf.pricePerHour}/hr</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {turf.sports.map((s) => (
                    <Badge key={s} tone="blue">
                      {s.toUpperCase()}
                    </Badge>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">{turf.blurb}</p>

                <div className="text-[11px] text-muted-foreground flex items-center gap-2 pt-2 border-t border-border">
                  <Clock className="size-3" />
                  <span>
                    Hours: {turf.operatingHours.open} – {turf.operatingHours.close}
                  </span>
                </div>

                {turf.changesRequestedNote && turf.approvalStatus === 'CHANGES_REQUESTED' && (
                  <div className="rounded bg-amber-500/10 border border-amber-500/30 p-2.5 text-xs text-amber-300">
                    <p className="font-bold flex items-center gap-1">
                      <AlertCircle className="size-3.5" /> Changes Requested:
                    </p>
                    <p className="mt-1 text-[11px] opacity-90">{turf.changesRequestedNote}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-border flex items-center justify-between gap-2 text-xs">
              <Link
                to={`/owner/turfs/${turf.id}/edit`}
                className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
              >
                <Edit className="size-3.5" /> Edit Details
              </Link>
              <Link
                to="/owner/availability"
                className="inline-flex items-center gap-1 font-bold text-muted-foreground hover:text-foreground"
              >
                <Layers className="size-3.5" /> Manage Slots
              </Link>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full card-shell p-12 text-center text-muted-foreground">
            <Layers className="mx-auto size-10 mb-3 opacity-50" />
            <h3 className="font-display text-xl font-bold">No Venues Found</h3>
            <p className="text-xs mt-1">No grounds match the selected status filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
