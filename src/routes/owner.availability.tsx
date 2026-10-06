import { createFileRoute } from '@tanstack/react-router';
import { AvailabilityManager } from '@/features/availability/AvailabilityManager';

export const Route = createFileRoute('/owner/availability')({
  head: () => ({
    meta: [
      { title: 'Availability Matrix — Playo Owner' },
      { name: 'description', content: 'Manage pitch slot statuses, maintenance windows, and cart holds.' },
    ],
  }),
  component: OwnerAvailabilityPage,
});

function OwnerAvailabilityPage() {
  return (
    <div className="container-page py-10 space-y-6">
      <div>
        <p className="eyebrow">Operations & Dispatch</p>
        <h1 className="font-display text-4xl sm:text-5xl font-black">SLOT AVAILABILITY MATRIX</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time slot engine with conflict prevention, bulk maintenance, and 10-minute hold management.
        </p>
      </div>

      <AvailabilityManager />
    </div>
  );
}
