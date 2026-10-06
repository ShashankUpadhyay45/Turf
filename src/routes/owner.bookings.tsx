import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  XCircle, 
  UserX, 
  Phone, 
  Eye, 
  Layers, 
  FileText 
} from 'lucide-react';
import { Badge, Button, SectionHeading } from '@/components/ui';
import { useAuthStore } from '@/store/useAuthStore';
import { useBookingStore } from '@/store/useBookingStore';
import { useOwnerStore } from '@/store/useOwnerStore';
import type { Booking, BookingStatus, Sport } from '@/types';

export const Route = createFileRoute('/owner/bookings')({
  head: () => ({
    meta: [
      { title: 'Player Reservations — Playo Owner' },
      { name: 'description', content: 'Track match check-ins, complete bookings, and manage player records.' },
    ],
  }),
  component: OwnerBookingsPage,
});

function OwnerBookingsPage() {
  const user = useAuthStore((s) => s.user);
  const ownerId = user?.id ?? 'owner-1';
  const turfs = useOwnerStore((s) => s.turfs);
  const myTurfs = useMemo(() => turfs.filter((t) => t.ownerId === ownerId), [turfs, ownerId]);

  const allBookings = useBookingStore((s) => s.bookings);
  const markCompleted = useBookingStore((s) => s.markCompleted);
  const markNoShow = useBookingStore((s) => s.markNoShow);
  const cancelBooking = useBookingStore((s) => s.cancelBooking);

  // Filter states
  const [statusTab, setStatusTab] = useState<'all' | 'today' | 'upcoming' | 'completed' | 'cancelled' | 'no-show'>('all');
  const [selectedTurf, setSelectedTurf] = useState<string>('all');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewBookingModal, setViewBookingModal] = useState<Booking | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const todayIso = new Date().toISOString().split('T')[0]!;

  const filteredBookings = useMemo(() => {
    // Filter bookings belonging to this owner's turfs
    const ownerTurfIds = new Set(myTurfs.map((t) => t.id));
    // If admin, show all, otherwise show owner's turfs
    let list = user?.role === 'admin'
      ? allBookings
      : allBookings.filter((b) => b.ownerId === ownerId || ownerTurfIds.has(b.turfId));

    // Tab filter
    if (statusTab === 'today') {
      list = list.filter((b) => b.date === todayIso && b.status === 'confirmed');
    } else if (statusTab === 'upcoming') {
      list = list.filter((b) => b.date >= todayIso && b.status === 'confirmed');
    } else if (statusTab === 'completed') {
      list = list.filter((b) => b.status === 'completed');
    } else if (statusTab === 'cancelled') {
      list = list.filter((b) => b.status === 'cancelled');
    } else if (statusTab === 'no-show') {
      list = list.filter((b) => b.status === 'no-show');
    }

    // Venue filter
    if (selectedTurf !== 'all') {
      list = list.filter((b) => b.turfId === selectedTurf);
    }

    // Sport filter
    if (selectedSport !== 'all') {
      list = list.filter((b) => b.sport === selectedSport);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.referenceCode.toLowerCase().includes(q) ||
          b.userName?.toLowerCase().includes(q) ||
          b.turfName.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allBookings, myTurfs, ownerId, user, statusTab, selectedTurf, selectedSport, searchQuery, todayIso]);

  const showToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleExportCsv = () => {
    showToast('Export initiated: Downloading player bookings manifest (CSV placeholder).');
  };

  return (
    <div className="container-page py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Match Operations</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black">PLAYER RESERVATIONS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor real-time match check-ins, verify electronic passes, and update match statuses.
          </p>
        </div>
        <Button variant="secondary" onClick={handleExportCsv} className="text-xs">
          <Download className="size-4 mr-1.5" /> Export Bookings (CSV)
        </Button>
      </div>

      {actionNotice && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-400 animate-in fade-in">
          {actionNotice}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {[
          { id: 'all', label: 'All Bookings' },
          { id: 'today', label: "Today's Games" },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'completed', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled' },
          { id: 'no-show', label: 'No-Show' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusTab(tab.id as any)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              statusTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search player, ref #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <select
          value={selectedTurf}
          onChange={(e) => setSelectedTurf(e.target.value)}
          aria-label="Filter by venue"
          className="h-10 rounded-md border border-border bg-card px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All My Venues</option>
          {myTurfs.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <select
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value)}
          aria-label="Filter by sport"
          className="h-10 rounded-md border border-border bg-card px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Sports</option>
          <option value="football">Football</option>
          <option value="cricket">Cricket</option>
          <option value="badminton">Badminton</option>
          <option value="basketball">Basketball</option>
        </select>

        <div className="flex items-center justify-end text-xs font-mono text-muted-foreground">
          Showing {filteredBookings.length} records
        </div>
      </div>

      {/* Bookings Table */}
      <div className="card-shell overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-muted text-xs text-muted-foreground uppercase font-mono">
            <tr>
              <th className="p-4">Ref Code</th>
              <th className="p-4">Player Details</th>
              <th className="p-4">Venue & Time</th>
              <th className="p-4">Sport</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((b) => {
                const isConfirmed = b.status === 'confirmed';
                return (
                  <tr key={b.id} className="hover:bg-muted/30 transition">
                    <td className="p-4 font-mono font-bold text-xs">
                      #{b.referenceCode}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-foreground">{b.userName ?? 'Customer'}</p>
                      <p className="text-xs text-muted-foreground">{b.userPhone ?? '+91 98765 00000'}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-foreground">{b.turfName}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.date} · {b.startTime}
                      </p>
                    </td>
                    <td className="p-4">
                      <Badge tone="blue">{b.sport.toUpperCase()}</Badge>
                    </td>
                    <td className="p-4 font-extrabold text-foreground">
                      ₹{b.finalPrice}
                    </td>
                    <td className="p-4">
                      <Badge
                        tone={
                          b.status === 'confirmed'
                            ? 'green'
                            : b.status === 'completed'
                              ? 'blue'
                              : b.status === 'cancelled'
                                ? 'neutral'
                                : 'gold'
                        }
                      >
                        {b.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => setViewBookingModal(b)}
                        title="View Pass & Breakdown"
                        className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Eye className="size-4" />
                      </button>

                      {isConfirmed && (
                        <>
                          <button
                            onClick={() => {
                              markCompleted(b.id);
                              showToast(`Match #${b.referenceCode} marked as COMPLETED.`);
                            }}
                            title="Mark Match Completed"
                            className="rounded p-1.5 text-emerald-500 hover:bg-emerald-500/10"
                          >
                            <CheckCircle className="size-4" />
                          </button>
                          <button
                            onClick={() => {
                              markNoShow(b.id);
                              showToast(`Match #${b.referenceCode} marked as NO-SHOW.`);
                            }}
                            title="Mark No-Show"
                            className="rounded p-1.5 text-amber-500 hover:bg-amber-500/10"
                          >
                            <UserX className="size-4" />
                          </button>
                          <button
                            onClick={() => {
                              cancelBooking(b.id, 'Cancelled by Turf Owner');
                              showToast(`Match #${b.referenceCode} CANCELLED by owner.`);
                            }}
                            title="Cancel Booking"
                            className="rounded p-1.5 text-rose-500 hover:bg-rose-500/10"
                          >
                            <XCircle className="size-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="p-10 text-center text-muted-foreground">
                  <Calendar className="mx-auto size-8 opacity-40 mb-2" />
                  No reservations match the selected filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Booking View Modal */}
      {viewBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="card-shell w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="eyebrow">Match Details Pass</p>
                <h3 className="font-display text-2xl font-black">
                  REF #{viewBookingModal.referenceCode}
                </h3>
              </div>
              <Badge tone="green">{viewBookingModal.status.toUpperCase()}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-muted/50 p-3">
                <span className="text-muted-foreground font-bold">Player Name</span>
                <p className="font-black text-sm text-foreground mt-0.5">
                  {viewBookingModal.userName ?? 'Player'}
                </p>
                <p className="text-muted-foreground">{viewBookingModal.userPhone ?? 'N/A'}</p>
              </div>

              <div className="rounded-lg bg-muted/50 p-3">
                <span className="text-muted-foreground font-bold">Venue</span>
                <p className="font-black text-sm text-foreground mt-0.5">
                  {viewBookingModal.turfName}
                </p>
                <p className="text-muted-foreground">{viewBookingModal.sport.toUpperCase()}</p>
              </div>

              <div className="rounded-lg bg-muted/50 p-3">
                <span className="text-muted-foreground font-bold">Schedule</span>
                <p className="font-black text-sm text-foreground mt-0.5">
                  {viewBookingModal.date}
                </p>
                <p className="text-muted-foreground">{viewBookingModal.startTime} – {viewBookingModal.endTime}</p>
              </div>

              <div className="rounded-lg bg-muted/50 p-3">
                <span className="text-muted-foreground font-bold">Payment</span>
                <p className="font-black text-sm text-foreground mt-0.5">
                  ₹{viewBookingModal.finalPrice}
                </p>
                <p className="text-muted-foreground">{viewBookingModal.paymentMethod}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-border">
              <Button variant="secondary" onClick={() => setViewBookingModal(null)}>
                Close Pass
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
