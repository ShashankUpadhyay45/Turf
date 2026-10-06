import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  MapPin,
  Mail,
  Phone,
  Eye,
  Ban,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { Badge, Button, SectionHeading } from '@/components/ui';
import { useOwnerStore } from '@/store/useOwnerStore';
import { useBookingStore } from '@/store/useBookingStore';
import { ownerDemoCredentials } from '@/data/mock-users';
import { indianCities } from '@/data/turfs';
import type { OwnerDemoCredential } from '@/types';

export const Route = createFileRoute('/admin/owners')({
  head: () => ({
    meta: [
      { title: 'Venue Operators Directory — SuperAdmin' },
      { name: 'description', content: 'Directory of registered venue operators, KYC badges, and accuracy scores across 14 cities.' },
    ],
  }),
  component: AdminOwnersPage,
});

function AdminOwnersPage() {
  const turfs = useOwnerStore((s) => s.turfs);
  const bookings = useBookingStore((s) => s.bookings);

  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'verified' | 'pending' | 'suspended'>('all');
  const [inspectOwner, setInspectOwner] = useState<OwnerDemoCredential | null>(null);
  const [suspendedOwners, setSuspendedOwners] = useState<Set<string>>(new Set());

  // Combine owner credentials with real dynamic turf counts and revenue
  const ownersList = useMemo(() => {
    return ownerDemoCredentials.map((o) => {
      const ownerTurfs = turfs.filter((t) => t.ownerId === o.ownerId);
      const ownerTurfIds = new Set(ownerTurfs.map((t) => t.id));
      const ownerBookings = bookings.filter((b) => b.ownerId === o.ownerId || ownerTurfIds.has(b.turfId));
      const revenue = ownerBookings.reduce((acc, b) => acc + (b.finalPrice ?? 0), 0);
      const isSuspended = suspendedOwners.has(o.ownerId);

      return {
        ...o,
        actualVenues: ownerTurfs,
        venueCount: ownerTurfs.length || o.venueCount,
        venueNames: ownerTurfs.length > 0 ? ownerTurfs.map((t) => t.name) : o.venueNames,
        bookingsCount: ownerBookings.length,
        revenue,
        isSuspended,
      };
    });
  }, [turfs, bookings, suspendedOwners]);

  const filtered = useMemo(() => {
    return ownersList.filter((o) => {
      if (selectedCity !== 'All' && o.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }
      if (selectedStatus === 'verified' && !o.isVerified) return false;
      if (selectedStatus === 'suspended' && !o.isSuspended) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = o.businessName.toLowerCase().includes(q) || o.ownerName.toLowerCase().includes(q);
        const matchCity = o.city.toLowerCase().includes(q);
        const matchEmail = o.email.toLowerCase().includes(q);
        const matchVenues = o.venueNames.some((v) => v.toLowerCase().includes(q));
        if (!matchName && !matchCity && !matchEmail && !matchVenues) return false;
      }

      return true;
    });
  }, [ownersList, selectedCity, selectedStatus, search]);

  const toggleSuspend = (ownerId: string) => {
    setSuspendedOwners((prev) => {
      const next = new Set(prev);
      if (next.has(ownerId)) next.delete(ownerId);
      else next.add(ownerId);
      return next;
    });
  };

  return (
    <div className="container-page py-8 space-y-8 animate-in fade-in">
      <div>
        <span className="text-xs font-black uppercase text-destructive tracking-wider">
          Platform Governance
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
          Venue Partners & Operators Directory
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Inspect 22+ registered business partners across 14 Indian cities, KYC verifications, and compliance states.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="card-shell p-5 space-y-1.5">
          <span className="text-xs font-bold text-muted-foreground uppercase">Registered Owners</span>
          <p className="font-display text-3xl font-black text-foreground">{ownerDemoCredentials.length}</p>
          <span className="text-[11px] text-muted-foreground">Across 14 metro regions</span>
        </div>

        <div className="card-shell p-5 space-y-1.5">
          <span className="text-xs font-bold text-muted-foreground uppercase">KYC Verified</span>
          <p className="font-display text-3xl font-black text-emerald-500">
            {ownerDemoCredentials.filter((o) => o.isVerified).length}
          </p>
          <span className="text-[11px] text-muted-foreground">Document inspection approved</span>
        </div>

        <div className="card-shell p-5 space-y-1.5">
          <span className="text-xs font-bold text-muted-foreground uppercase">Total Listed Facilities</span>
          <p className="font-display text-3xl font-black text-primary">{turfs.length}</p>
          <span className="text-[11px] text-muted-foreground">Sports turfs & gaming zones</span>
        </div>

        <div className="card-shell p-5 space-y-1.5">
          <span className="text-xs font-bold text-muted-foreground uppercase">Suspended Partners</span>
          <p className="font-display text-3xl font-black text-destructive">{suspendedOwners.size}</p>
          <span className="text-[11px] text-muted-foreground">Compliance violations</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card-shell p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search business name, email, city, or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            aria-label="Filter by City"
            className="rounded-xl border border-border bg-background px-3 py-2.5 text-xs sm:text-sm font-bold text-foreground focus:border-primary focus:outline-hidden"
          >
            <option value="All">All Cities (14)</option>
            {indianCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            aria-label="Filter by Status"
            className="rounded-xl border border-border bg-background px-3 py-2.5 text-xs sm:text-sm font-bold text-foreground focus:border-primary focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="verified">KYC Verified</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Operators Directory Table */}
      <div className="card-shell overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border/80 text-muted-foreground uppercase font-black text-[10px]">
              <tr>
                <th className="p-4">Business / Partner</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">City</th>
                <th className="p-4">Venues Operated</th>
                <th className="p-4">KYC Status</th>
                <th className="p-4">Account State</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((o) => (
                <tr key={o.ownerId} className="hover:bg-muted/30 transition">
                  <td className="p-4 font-bold text-foreground max-w-xs">
                    <p className="font-extrabold text-foreground">{o.businessName}</p>
                    <span className="text-[10px] text-muted-foreground font-mono block">
                      ID: {o.ownerId} · {o.notes ?? 'Sports Partner'}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    <p className="text-foreground font-medium">{o.email}</p>
                    <span className="text-[11px] block">{o.password ? `Demo: ${o.password}` : ''}</span>
                  </td>
                  <td className="p-4 font-bold text-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3 text-primary" /> {o.city}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-foreground">
                      {o.venueCount} Facility{o.venueCount === 1 ? '' : 'ies'}
                    </span>
                    <span className="text-[10px] text-muted-foreground block truncate max-w-[180px]">
                      {o.venueNames.join(', ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge tone={o.isVerified ? 'success' : 'warn'}>
                      {o.isVerified ? 'KYC VERIFIED ✓' : 'PENDING'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge tone={o.isSuspended ? 'danger' : 'neutral'}>
                      {o.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                    </Badge>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInspectOwner(o)}
                    >
                      <Eye className="size-3.5 mr-1" /> Inspect
                    </Button>
                    <Button
                      tone={o.isSuspended ? 'success' : 'destructive'}
                      size="sm"
                      onClick={() => toggleSuspend(o.ownerId)}
                    >
                      {o.isSuspended ? <CheckCircle className="size-3.5" /> : <Ban className="size-3.5" />}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Owner Modal */}
      {inspectOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-border/60 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-primary">
                  Partner Profile & Verification
                </span>
                <h3 className="font-display text-xl font-black text-foreground">
                  {inspectOwner.businessName}
                </h3>
                <p className="text-xs text-muted-foreground">{inspectOwner.city} Metro Area</p>
              </div>
              <button
                onClick={() => setInspectOwner(null)}
                className="text-muted-foreground hover:text-foreground font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Login Email
                </span>
                <span className="font-mono text-foreground font-bold">{inspectOwner.email}</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Demo Password
                </span>
                <span className="font-mono text-foreground font-bold">{inspectOwner.password}</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  GST Verification
                </span>
                <span className="text-emerald-500 font-bold">Verified on Portal ✓</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Bank Settlement Status
                </span>
                <span className="text-emerald-500 font-bold">Escrow Verified ✓</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-foreground block">Operated Facilities:</span>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {inspectOwner.venueNames.map((name, i) => (
                  <div key={i} className="p-2 rounded-lg border border-border/60 bg-background flex items-center justify-between">
                    <span className="font-medium text-foreground">{name}</span>
                    <Badge tone="success" size="sm">LIVE SLOTS</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setInspectOwner(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
