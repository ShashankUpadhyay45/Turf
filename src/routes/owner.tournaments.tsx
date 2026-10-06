import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import {
  Trophy,
  Plus,
  Calendar,
  Users,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Edit,
  Radio,
  FileText,
} from 'lucide-react';
import { Badge, Button, SectionHeading } from '@/components/ui';
import { useAuthStore } from '@/store/useAuthStore';
import { useTournamentStore } from '@/store/useTournamentStore';
import { useOwnerStore } from '@/store/useOwnerStore';
import type { Tournament, EventType } from '@/types';

export const Route = createFileRoute('/owner/tournaments')({
  head: () => ({
    meta: [
      { title: 'Tournament & Event Management — Playo Owner' },
      { name: 'description', content: 'Create, host, and manage tournaments, cups, and gaming events at your venues.' },
    ],
  }),
  component: OwnerTournamentsPage,
});

function OwnerTournamentsPage() {
  const user = useAuthStore((s) => s.user);
  const ownerId = user?.id ?? 'owner-1';

  const allTurfs = useOwnerStore((s) => s.turfs);
  const myVenues = useMemo(() => allTurfs.filter((t) => t.ownerId === ownerId), [allTurfs, ownerId]);
  const allTournaments = useTournamentStore((s) => s.tournaments);
  const createTournament = useTournamentStore((s) => s.createTournament);
  const updateTournament = useTournamentStore((s) => s.updateTournament);
  const deleteTournament = useTournamentStore((s) => s.deleteTournament);
  const publishTournament = useTournamentStore((s) => s.publishTournament);
  const unpublishTournament = useTournamentStore((s) => s.unpublishTournament);

  // Filter tournaments belonging strictly to this owner
  const myTournaments = useMemo(() => {
    return allTournaments.filter((t) => t.ownerId === ownerId);
  }, [allTournaments, ownerId]);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewRegistrationsModal, setViewRegistrationsModal] = useState<Tournament | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venueId, setVenueId] = useState(myVenues[0]?.id ?? '');
  const [sport, setSport] = useState('football');
  const [eventType, setEventType] = useState<EventType>('tournament');
  const [format, setFormat] = useState('7-a-side Knockout');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-02');
  const [startTime, setStartTime] = useState('08:00 AM');
  const [endTime, setEndTime] = useState('04:00 PM');
  const [regDeadline, setRegDeadline] = useState('2026-10-28');
  const [entryFee, setEntryFee] = useState(1500);
  const [prizePool, setPrizePool] = useState(20000);
  const [maxParticipants, setMaxParticipants] = useState(16);
  const [rules, setRules] = useState('Standard tournament rules apply.');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selVenue = myVenues.find((v) => v.id === venueId) ?? myVenues[0];

    createTournament({
      ownerId,
      venueId: selVenue?.id ?? 'venue-1',
      title,
      description,
      sport,
      eventType,
      format,
      startDate,
      endDate,
      startTime,
      endTime,
      registrationDeadline: regDeadline,
      entryFee: Number(entryFee),
      prizePool: Number(prizePool),
      maxParticipants: Number(maxParticipants),
      status: 'registration_open',
      rules,
      venueName: selVenue?.name ?? 'My Venue',
      venueCity: selVenue?.city ?? 'Dehradun',
      venueArea: selVenue?.area ?? 'Downtown',
      contactEmail: user?.email ?? 'owner@playo.in',
    });

    setCreateModalOpen(false);
    // Reset form
    setTitle('');
    setDescription('');
  };

  return (
    <div className="container-page py-8 space-y-8 animate-in fade-in">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase text-primary tracking-wider">
            Owner Command Portal
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
            Tournaments & Event Hosting
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Host leagues, community cups, and gaming battles at your verified venues.
          </p>
        </div>

        <Button
          tone="primary"
          onClick={() => {
            if (myVenues.length > 0 && !venueId) {
              setVenueId(myVenues[0]!.id);
            }
            setCreateModalOpen(true);
          }}
          className="rounded-xl px-5 py-2.5 font-bold shrink-0 shadow-xs"
        >
          <Plus className="size-4 mr-2" /> Host New Tournament
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-shell p-5 space-y-2">
          <span className="text-xs font-bold text-muted-foreground uppercase">Hosted Events</span>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-3xl font-black text-foreground">
              {myTournaments.length}
            </span>
            <Trophy className="size-6 text-primary" />
          </div>
          <p className="text-[11px] text-muted-foreground">Across your listed facilities</p>
        </div>

        <div className="card-shell p-5 space-y-2">
          <span className="text-xs font-bold text-muted-foreground uppercase">Active Registrations</span>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-3xl font-black text-foreground">
              {myTournaments.reduce((acc, cur) => acc + cur.currentParticipants, 0)}
            </span>
            <Users className="size-6 text-emerald-500" />
          </div>
          <p className="text-[11px] text-muted-foreground">Teams & solo participants enrolled</p>
        </div>

        <div className="card-shell p-5 space-y-2">
          <span className="text-xs font-bold text-muted-foreground uppercase">Total Prize Money</span>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-3xl font-black text-amber-500">
              ₹{myTournaments.reduce((acc, cur) => acc + (cur.prizePool ?? 0), 0).toLocaleString()}
            </span>
            <Radio className="size-6 text-amber-500" />
          </div>
          <p className="text-[11px] text-muted-foreground">Committed player prize pools</p>
        </div>
      </div>

      {/* Tournaments List */}
      <div className="space-y-4">
        <SectionHeading
          title="Your Venue Tournaments"
          subtitle={`Showing tournaments belonging strictly to ${user?.name ?? 'your business'}`}
        />

        {myTournaments.length === 0 ? (
          <div className="card-shell p-12 text-center space-y-3">
            <Trophy className="size-12 text-muted-foreground mx-auto" />
            <h3 className="font-display text-lg font-black text-foreground">No Tournaments Hosted Yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Boost venue footfall and tournament revenue by hosting your first football cup, box cricket league, or esports match day.
            </p>
            <Button tone="primary" onClick={() => setCreateModalOpen(true)}>
              <Plus className="size-4 mr-2" /> Create First Tournament
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {myTournaments.map((t) => (
              <div
                key={t.id}
                className="card-shell p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-primary/50 transition"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-black text-primary uppercase">
                      {t.sport ? t.sport : t.category ?? 'Event'}
                    </span>
                    <Badge tone={t.status === 'registration_open' ? 'success' : 'neutral'}>
                      {t.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Format: <strong className="text-foreground">{t.format ?? 'Standard'}</strong>
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-black text-foreground">
                    {t.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5 text-primary" /> {t.venueName} ({t.venueCity})
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5 text-primary" /> {t.startDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="size-3.5 text-primary" /> {t.currentParticipants} / {t.maxParticipants} Teams
                    </span>
                    <span className="font-bold text-foreground">
                      Fee: {t.entryFee === 0 ? 'Free' : `₹${t.entryFee}`}
                    </span>
                    {t.prizePool && (
                      <span className="font-bold text-amber-500">
                        Pool: ₹{t.prizePool.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewRegistrationsModal(t)}
                  >
                    <Eye className="size-3.5 mr-1.5" /> Registrations ({t.currentParticipants})
                  </Button>

                  {t.status === 'registration_open' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => unpublishTournament(t.id, ownerId)}
                    >
                      Close Registration
                    </Button>
                  ) : (
                    <Button
                      tone="primary"
                      size="sm"
                      onClick={() => publishTournament(t.id, ownerId)}
                    >
                      Open Registration
                    </Button>
                  )}

                  <Button
                    tone="destructive"
                    size="sm"
                    onClick={() => deleteTournament(t.id, ownerId)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Host New Tournament Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="font-display text-xl font-black text-foreground">
                  Host New Tournament / Event
                </h3>
                <p className="text-xs text-muted-foreground">
                  Configure format, registration limits, and prizes for your venue.
                </p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-foreground">Tournament Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dehradun Football Champions Cup"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Host Venue *</label>
                  <select
                    value={venueId}
                    onChange={(e) => setVenueId(e.target.value)}
                    required
                    aria-label="Host Venue"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
                  >
                    {myVenues.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Sport / Activity *</label>
                  <select
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                    aria-label="Sport or Activity"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
                  >
                    <option value="football">Football</option>
                    <option value="cricket">Cricket</option>
                    <option value="badminton">Badminton</option>
                    <option value="pickleball">Pickleball</option>
                    <option value="multi-sport">Multi-Sport Gaming / Esports</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Event Format</label>
                  <input
                    type="text"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    placeholder="e.g. 7-a-side Knockout + Group Stage"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Max Teams / Participants</label>
                  <input
                    type="number"
                    min="2"
                    max="128"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="e.g. 08:00 AM"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Team Entry Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={entryFee}
                    onChange={(e) => setEntryFee(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Prize Pool (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={prizePool}
                    onChange={(e) => setPrizePool(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-foreground">Description *</label>
                  <textarea
                    required
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Overview of the event, eligibility, and match scheduling."
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
                <Button variant="outline" type="button" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button tone="primary" type="submit">
                  Publish Tournament
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registrations Inspection Modal */}
      {viewRegistrationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="font-display text-lg font-black text-foreground">
                  Registered Teams ({viewRegistrationsModal.currentParticipants})
                </h3>
                <p className="text-xs text-muted-foreground">
                  {viewRegistrationsModal.title} · Capacity: {viewRegistrationsModal.maxParticipants}
                </p>
              </div>
              <button
                onClick={() => setViewRegistrationsModal(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {(!viewRegistrationsModal.registrations || viewRegistrationsModal.registrations.length === 0) ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No teams registered yet. Registrations will appear here in real time.
              </p>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-2.5">
                {viewRegistrationsModal.registrations.map((r, i) => (
                  <div
                    key={r.id || i}
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-background text-xs"
                  >
                    <div>
                      <p className="font-bold text-foreground">{r.teamName || r.userName}</p>
                      <p className="text-muted-foreground text-[11px]">
                        Registered by {r.userName} · {r.registeredAt ? new Date(r.registeredAt).toLocaleDateString() : 'Recent'}
                      </p>
                    </div>
                    <Badge tone="success">CONFIRMED</Badge>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setViewRegistrationsModal(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
