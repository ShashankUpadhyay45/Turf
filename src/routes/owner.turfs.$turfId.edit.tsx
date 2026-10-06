import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Sparkles, Check, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { ActionLink, Badge, Button, SectionHeading } from '@/components/ui';
import { useAuthStore } from '@/store/useAuthStore';
import { useOwnerStore } from '@/store/useOwnerStore';
import { ListingStatusBadge } from '@/features/approval/ListingStatusBadge';
import type { Sport } from '@/types';

export const Route = createFileRoute('/owner/turfs/$turfId/edit')({
  head: () => ({
    meta: [
      { title: 'Edit Venue — Playo Owner' },
      { name: 'description', content: 'Update turf pricing, amenities, operating hours, and photos.' },
    ],
  }),
  component: OwnerEditTurfPage,
});

function OwnerEditTurfPage() {
  const { turfId } = Route.useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const getTurfById = useOwnerStore((s) => s.getTurfById);
  const updateTurf = useOwnerStore((s) => s.updateTurf);
  const submitTurfForReview = useOwnerStore((s) => s.submitTurfForReview);

  const turf = getTurfById(turfId);

  const [formData, setFormData] = useState({
    name: '',
    blurb: '',
    description: '',
    address: '',
    area: '',
    city: '',
    pricePerHour: 700,
    peakPricePerHour: 900,
    weekendPricePerHour: 850,
    openTime: '06:00 AM',
    closeTime: '11:00 PM',
    sports: ['football'] as Sport[],
    amenities: [] as string[],
    cancellationPolicy: '',
  });

  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (turf) {
      setFormData({
        name: turf.name,
        blurb: turf.blurb,
        description: turf.description ?? '',
        address: turf.address,
        area: turf.area,
        city: turf.city,
        pricePerHour: turf.pricePerHour,
        peakPricePerHour: turf.peakPricePerHour ?? turf.pricePerHour + 200,
        weekendPricePerHour: turf.weekendPricePerHour ?? turf.pricePerHour + 150,
        openTime: turf.operatingHours.open,
        closeTime: turf.operatingHours.close,
        sports: turf.sports,
        amenities: turf.amenities,
        cancellationPolicy: turf.cancellationPolicy ?? '100% refund up to 4 hours before kickoff.',
      });
    }
  }, [turf]);

  if (!turf) {
    return (
      <div className="container-page py-16 text-center">
        <h2 className="font-display text-3xl font-black">Venue Not Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The requested ground does not exist or you do not have permission to view it.
        </p>
        <ActionLink to="/owner/turfs" variant="primary" className="mt-4">
          Back to My Venues
        </ActionLink>
      </div>
    );
  }

  // Security check: ensure current user owns this turf (unless admin)
  if (user && user.role !== 'admin' && turf.ownerId !== user.id) {
    return (
      <div className="container-page py-16 text-center">
        <h2 className="font-display text-3xl font-black text-destructive">Unauthorized Access</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You do not have administrative ownership of this sports facility.
        </p>
        <ActionLink to="/owner/turfs" variant="secondary" className="mt-4">
          Return to My Venues
        </ActionLink>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTurf(turf.id, {
      name: formData.name,
      blurb: formData.blurb,
      description: formData.description,
      address: formData.address,
      area: formData.area,
      city: formData.city,
      pricePerHour: Number(formData.pricePerHour),
      peakPricePerHour: Number(formData.peakPricePerHour),
      weekendPricePerHour: Number(formData.weekendPricePerHour),
      operatingHours: {
        open: formData.openTime,
        close: formData.closeTime,
      },
      sports: formData.sports,
      amenities: formData.amenities,
      cancellationPolicy: formData.cancellationPolicy,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleResubmit = () => {
    submitTurfForReview(turf.id);
    setSavedNotice(true);
    setTimeout(() => {
      navigate({ to: '/owner/turfs' });
    }, 1200);
  };

  const toggleAmenity = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(name)
        ? prev.amenities.filter((a) => a !== name)
        : [...prev.amenities, name],
    }));
  };

  return (
    <div className="container-page py-10 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ActionLink to="/owner/turfs" variant="secondary" size="sm">
            <ArrowLeft className="size-4 mr-1" /> Back
          </ActionLink>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-3xl sm:text-4xl font-black">EDIT {turf.name}</h1>
              <ListingStatusBadge status={turf.approvalStatus} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ref ID: #{turf.id} · Created {turf.submittedAt ? new Date(turf.submittedAt).toLocaleDateString() : 'Active'}
            </p>
          </div>
        </div>

        {turf.approvalStatus === 'CHANGES_REQUESTED' && (
          <Button onClick={handleResubmit} variant="primary">
            <RefreshCw className="size-4 mr-1.5" />
            Resubmit for Review
          </Button>
        )}
      </div>

      {savedNotice && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-400 animate-in fade-in flex items-center gap-2">
          <Check className="size-4" />
          Venue modifications saved successfully.
        </div>
      )}

      {turf.changesRequestedNote && turf.approvalStatus === 'CHANGES_REQUESTED' && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-200 space-y-1">
          <p className="font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <AlertCircle className="size-4" /> Required Changes from Platform Compliance:
          </p>
          <p className="leading-relaxed">{turf.changesRequestedNote}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Main Details */}
        <div className="space-y-6">
          <div className="card-shell p-6 space-y-4">
            <h2 className="font-display text-2xl font-black">Basic Information</h2>
            <div className="grid gap-4">
              <label className="grid gap-1 text-xs font-bold">
                Venue Name
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-11 rounded-md border border-input bg-background px-3 font-normal text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </label>

              <label className="grid gap-1 text-xs font-bold">
                Tagline / Short Summary
                <input
                  value={formData.blurb}
                  onChange={(e) => setFormData({ ...formData, blurb: e.target.value })}
                  required
                  className="h-11 rounded-md border border-input bg-background px-3 font-normal text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </label>

              <label className="grid gap-1 text-xs font-bold">
                Full Venue Description
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="rounded-md border border-input bg-background p-3 font-normal text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
            </div>
          </div>

          {/* Dynamic Pricing Engine UI */}
          <div className="card-shell p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-black">Dynamic Pricing Controls</h2>
                <p className="text-xs text-muted-foreground">
                  Configured rates apply transparently to the slot availability selector.
                </p>
              </div>
              <Badge tone="blue">Hourly INR (₹)</Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="grid gap-1 text-xs font-bold">
                Base Hourly Price (₹)
                <input
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({ ...formData, pricePerHour: Number(e.target.value) })}
                  className="h-11 rounded-md border border-input bg-background px-3 font-normal text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-[10px] text-muted-foreground">Weekday standard hours</span>
              </label>

              <label className="grid gap-1 text-xs font-bold">
                Peak Hours Price (₹)
                <input
                  type="number"
                  value={formData.peakPricePerHour}
                  onChange={(e) => setFormData({ ...formData, peakPricePerHour: Number(e.target.value) })}
                  className="h-11 rounded-md border border-input bg-background px-3 font-normal text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-[10px] text-muted-foreground">7:00 PM – 10:00 PM</span>
              </label>

              <label className="grid gap-1 text-xs font-bold">
                Weekend Rate (₹)
                <input
                  type="number"
                  value={formData.weekendPricePerHour}
                  onChange={(e) => setFormData({ ...formData, weekendPricePerHour: Number(e.target.value) })}
                  className="h-11 rounded-md border border-input bg-background px-3 font-normal text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-[10px] text-muted-foreground">Saturdays & Sundays</span>
              </label>
            </div>

            <div className="rounded-lg bg-info-soft/40 border border-info/30 p-3 text-xs text-info flex items-center gap-2">
              <Sparkles className="size-4 shrink-0" />
              <span>
                Tip: Higher peak rates encourage teams to book morning and weekday slots, lifting overall ground occupancy.
              </span>
            </div>
          </div>

          {/* Location & Address */}
          <div className="card-shell p-6 space-y-4">
            <h2 className="font-display text-2xl font-black">Location & Address</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="grid gap-1 text-xs font-bold sm:col-span-3">
                Full Street Address
                <input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="h-11 rounded-md border border-input bg-background px-3 font-normal text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
              <label className="grid gap-1 text-xs font-bold sm:col-span-2">
                Locality / Area
                <input
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="h-11 rounded-md border border-input bg-background px-3 font-normal text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
              <label className="grid gap-1 text-xs font-bold">
                City
                <input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="h-11 rounded-md border border-input bg-background px-3 font-normal text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
            </div>
          </div>

          {/* Amenities & Operating Hours */}
          <div className="card-shell p-6 space-y-4">
            <h2 className="font-display text-2xl font-black">Facilities & Amenities</h2>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {[
                'Floodlights',
                'Parking',
                'Changing room',
                'Washroom',
                'Drinking water',
                'Seating',
                'Equipment rental',
                'Canteen',
                'Shower',
                'Locker Room',
                'Wi-Fi',
                'First Aid',
              ].map((am) => {
                const active = formData.amenities.includes(am);
                return (
                  <button
                    key={am}
                    type="button"
                    onClick={() => toggleAmenity(am)}
                    className={`rounded-lg border p-3 text-left text-xs font-bold transition flex items-center justify-between ${
                      active ? 'border-primary bg-secondary text-foreground' : 'border-border bg-card text-muted-foreground'
                    }`}
                  >
                    <span>{am}</span>
                    {active && <Check className="size-3.5 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Aside Sticky Controls */}
        <aside className="space-y-6">
          <div className="card-shell p-5 space-y-4 sticky top-24">
            <h3 className="font-display text-xl font-bold">Publishing Status</h3>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Current State:</span>
              <ListingStatusBadge status={turf.approvalStatus} />
            </div>

            <div className="pt-2 border-t border-border space-y-2">
              <Button type="submit" className="w-full">
                <Save className="size-4 mr-1.5" /> Save Changes
              </Button>
              {turf.approvalStatus === 'CHANGES_REQUESTED' && (
                <Button type="button" onClick={handleResubmit} variant="secondary" className="w-full">
                  <RefreshCw className="size-4 mr-1.5" /> Resubmit Listing
                </Button>
              )}
            </div>

            <div className="rounded-lg bg-muted/60 p-3.5 text-xs text-muted-foreground space-y-2">
              <p className="font-bold text-foreground">Venue Safeguards</p>
              <p className="leading-relaxed">
                Operating hours and GPS coordinates can be adjusted at any time. Address modifications require re-verification.
              </p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
