import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { CalendarCheck, Search, Filter, Download, CheckCircle, Clock } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { useBookingStore } from '@/store/useBookingStore';

export const Route = createFileRoute('/admin/bookings')({
  head: () => ({
    meta: [
      { title: 'Platform Bookings — SuperAdmin' },
      { name: 'description', content: 'Complete audit log of all sports match bookings across all venues.' },
    ],
  }),
  component: AdminBookingsPage,
});

function AdminBookingsPage() {
  const allBookings = useBookingStore((s) => s.bookings);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    let list = allBookings;
    if (statusFilter !== 'all') {
      list = list.filter((b) => b.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return list.filter(
        (b) =>
          b.referenceCode.toLowerCase().includes(q) ||
          b.turfName.toLowerCase().includes(q) ||
          b.userName?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allBookings, statusFilter, search]);

  return (
    <div className="container-page py-10 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-5">
        <div>
          <p className="eyebrow">Financial & Match Records</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black">PLATFORM BOOKINGS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete transaction record of matches, payment channels, and cancellations.
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
              placeholder="Search reference #, ground, player..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter status"
            className="h-10 rounded-md border border-border bg-card px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <span className="text-xs text-muted-foreground font-mono">
          {filtered.length} total records
        </span>
      </div>

      {/* Bookings Table */}
      <div className="card-shell overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-muted text-xs text-muted-foreground uppercase font-mono">
            <tr>
              <th className="p-4">Ref Code</th>
              <th className="p-4">Venue</th>
              <th className="p-4">Player</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4">Payment Method</th>
              <th className="p-4">Net Price</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-muted/30 transition">
                <td className="p-4 font-mono font-bold text-xs">#{b.referenceCode}</td>
                <td className="p-4 font-bold text-foreground">{b.turfName}</td>
                <td className="p-4 text-xs text-muted-foreground">{b.userName ?? 'Player'}</td>
                <td className="p-4 text-xs text-muted-foreground">
                  {b.date} · {b.startTime}
                </td>
                <td className="p-4 text-xs font-mono text-muted-foreground">{b.paymentMethod}</td>
                <td className="p-4 font-extrabold text-foreground">₹{b.finalPrice}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
