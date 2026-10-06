import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import {
  Trophy,
  Search,
  Filter,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { Badge, Button, SectionHeading } from '@/components/ui';
import { useTournamentStore } from '@/store/useTournamentStore';
import type { Tournament } from '@/types';

export const Route = createFileRoute('/admin/tournaments')({
  head: () => ({
    meta: [
      { title: 'Platform Tournaments & Event Moderation — Playo Admin' },
      { name: 'description', content: 'Audit, moderate, and manage all sporting competitions and tournaments hosted on Playo.' },
    ],
  }),
  component: AdminTournamentsPage,
});

function AdminTournamentsPage() {
  const tournaments = useTournamentStore((s) => s.tournaments);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return tournaments.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !t.title.toLowerCase().includes(q) &&
          !t.venueName?.toLowerCase().includes(q) &&
          !t.venueCity?.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [tournaments, statusFilter, searchQuery]);

  const totalPrizePool = useMemo(() => {
    return tournaments.reduce((acc, t) => acc + (t.prizePool ?? 0), 0);
  }, [tournaments]);

  return (
    <div className="container-page py-8 space-y-8 animate-in fade-in">
      <div>
        <span className="text-xs font-black uppercase text-destructive tracking-wider">
          Platform Administration
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
          Tournaments & Competitions Moderation
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review, oversee prize distributions, and moderate tournaments created across all owner facilities.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="card-shell p-5 space-y-1.5">
          <span className="text-xs font-bold text-muted-foreground uppercase">Total Tournaments</span>
          <p className="font-display text-3xl font-black text-foreground">{tournaments.length}</p>
          <span className="text-[11px] text-muted-foreground">Platform-wide events</span>
        </div>

        <div className="card-shell p-5 space-y-1.5">
          <span className="text-xs font-bold text-muted-foreground uppercase">Registration Open</span>
          <p className="font-display text-3xl font-black text-emerald-500">
            {tournaments.filter((t) => t.status === 'registration_open').length}
          </p>
          <span className="text-[11px] text-muted-foreground">Active player sign-ups</span>
        </div>

        <div className="card-shell p-5 space-y-1.5">
          <span className="text-xs font-bold text-muted-foreground uppercase">Total Prize Pools</span>
          <p className="font-display text-3xl font-black text-amber-500">
            ₹{totalPrizePool.toLocaleString()}
          </p>
          <span className="text-[11px] text-muted-foreground">Escrow & venue cash prizes</span>
        </div>

        <div className="card-shell p-5 space-y-1.5">
          <span className="text-xs font-bold text-muted-foreground uppercase">Total Participants</span>
          <p className="font-display text-3xl font-black text-primary">
            {tournaments.reduce((acc, t) => acc + t.currentParticipants, 0)}
          </p>
          <span className="text-[11px] text-muted-foreground">Enrolled teams/athletes</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="card-shell p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tournament title, host venue, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter tournaments by status"
          className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-bold text-foreground focus:border-primary focus:outline-hidden shrink-0"
        >
          <option value="all">All Statuses</option>
          <option value="registration_open">Registration Open</option>
          <option value="draft">Draft</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Moderation Table */}
      <div className="card-shell overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border/80 text-muted-foreground uppercase font-black text-[10px]">
              <tr>
                <th className="p-4">Tournament</th>
                <th className="p-4">Host Venue & City</th>
                <th className="p-4">Sport / Type</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Entry / Prize</th>
                <th className="p-4">Enrolled</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-muted/30 transition">
                  <td className="p-4 font-bold text-foreground max-w-xs">
                    <p className="truncate">{t.title}</p>
                    <span className="text-[10px] text-muted-foreground block">
                      ID: {t.id} · Owner: {t.ownerId}
                    </span>
                  </td>
                  <td className="p-4 text-foreground">
                    <p className="font-medium">{t.venueName}</p>
                    <span className="text-[11px] text-muted-foreground">{t.venueCity}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-primary uppercase">{t.sport || t.category}</span>
                    <span className="text-[10px] text-muted-foreground block">{t.eventType}</span>
                  </td>
                  <td className="p-4 text-foreground">
                    <p>{t.startDate}</p>
                    <span className="text-[11px] text-muted-foreground">{t.startTime}</span>
                  </td>
                  <td className="p-4 font-medium">
                    <p className="text-foreground">
                      Fee: {t.entryFee === 0 ? 'Free' : `₹${t.entryFee}`}
                    </p>
                    {t.prizePool ? (
                      <span className="font-bold text-amber-500 text-[11px]">
                        Pool: ₹{t.prizePool.toLocaleString()}
                      </span>
                    ) : null}
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-foreground">
                      {t.currentParticipants} / {t.maxParticipants}
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge tone={t.status === 'registration_open' ? 'success' : 'neutral'}>
                      {t.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
