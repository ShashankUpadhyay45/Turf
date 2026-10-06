import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Layers, MapPin, Search, Plus, ExternalLink, CheckCircle } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { useOwnerStore } from '@/store/useOwnerStore';
import { ListingStatusBadge } from '@/features/approval/ListingStatusBadge';
import { VerificationBadge } from '@/features/verification/VerificationBadges';

export const Route = createFileRoute('/admin/turfs')({
  head: () => ({
    meta: [
      { title: 'Master Turf Registry — SuperAdmin' },
      { name: 'description', content: 'Complete registry of verified sports arenas and grounds.' },
    ],
  }),
  component: AdminTurfsPage,
});

function AdminTurfsPage() {
  const turfs = useOwnerStore((s) => s.turfs);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');

  const filtered = turfs.filter((t) => {
    if (cityFilter !== 'all' && t.city.toLowerCase() !== cityFilter.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.area.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="container-page py-10 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-5">
        <div>
          <p className="eyebrow">Platform Catalog</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black">MASTER VENUE REGISTRY</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All sports grounds across 14 supported metropolitan cities.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search ground name, area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            aria-label="Filter city"
            className="h-10 rounded-md border border-border bg-card px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Cities</option>
            <option value="dehradun">Dehradun</option>
            <option value="delhi">Delhi</option>
            <option value="bengaluru">Bengaluru</option>
            <option value="mumbai">Mumbai</option>
            <option value="hyderabad">Hyderabad</option>
            <option value="kolkata">Kolkata</option>
          </select>
        </div>

        <span className="text-xs text-muted-foreground font-mono">
          {filtered.length} of {turfs.length} venues shown
        </span>
      </div>

      {/* Turfs Table */}
      <div className="card-shell overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-muted text-xs text-muted-foreground uppercase font-mono">
            <tr>
              <th className="p-4">Venue</th>
              <th className="p-4">City / Area</th>
              <th className="p-4">Sports</th>
              <th className="p-4">Hourly Rate</th>
              <th className="p-4">Trust Score</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-muted/30 transition">
                <td className="p-4">
                  <p className="font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.ownerName ?? 'Turf Owner'}</p>
                </td>
                <td className="p-4 text-xs text-muted-foreground">
                  {t.area}, {t.city}
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {t.sports.map((s) => (
                      <span key={s} className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase font-bold text-muted-foreground">
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-4 font-extrabold text-foreground">
                  ₹{t.pricePerHour}/hr
                </td>
                <td className="p-4 font-mono font-bold text-emerald-400">
                  {t.trustScore ?? 95}%
                </td>
                <td className="p-4">
                  <ListingStatusBadge status={t.approvalStatus} />
                </td>
                <td className="p-4 text-right">
                  <Link
                    to={`/turfs/${t.id}`}
                    className="inline-flex items-center gap-1 font-bold text-xs text-primary hover:underline"
                  >
                    Listing <ExternalLink className="size-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
