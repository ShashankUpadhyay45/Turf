import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import {
  Trophy,
  Calendar,
  MapPin,
  Clock,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { Badge, Button, SectionHeading } from '@/components/ui';
import { useTournamentStore } from '@/store/useTournamentStore';
import { useAuthStore } from '@/store/useAuthStore';
import { indianCities } from '@/data/turfs';
import type { Tournament } from '@/types';

export const Route = createFileRoute('/tournaments')({
  head: () => ({
    meta: [
      { title: 'Sports Tournaments & Gaming Events — Playo' },
      {
        name: 'description',
        content: 'Compete in football leagues, cricket cups, pickleball opens, and gaming tournaments across India with cash prizes.',
      },
    ],
  }),
  component: TournamentsPage,
});

function TournamentsPage() {
  const tournaments = useTournamentStore((s) => s.tournaments);
  const registerForTournament = useTournamentStore((s) => s.registerForTournament);
  const cancelRegistration = useTournamentStore((s) => s.cancelRegistration);
  const user = useAuthStore((s) => s.user);

  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [registerModal, setRegisterModal] = useState<Tournament | null>(null);
  const [teamName, setTeamName] = useState<string>('');
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  const sportsFilters = [
    { id: 'all', label: 'All Events' },
    { id: 'football', label: '⚽ Football Leagues' },
    { id: 'cricket', label: '🏏 Box Cricket' },
    { id: 'pickleball', label: '🏓 Pickleball Opens' },
    { id: 'gaming', label: '🎮 Esports & FIFA' },
    { id: 'kids', label: '🎈 Kids & Community' },
  ];

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      // Status filter: show public
      if (t.status === 'draft') return false;

      // City
      if (selectedCity !== 'All' && t.venueCity?.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // Sport / Category
      if (selectedSport !== 'all') {
        if (selectedSport === 'gaming') {
          if (t.eventType !== 'gaming_event' && !t.category?.toLowerCase().includes('gaming')) return false;
        } else if (selectedSport === 'kids') {
          if (t.eventType !== 'kids_event' && !t.category?.toLowerCase().includes('kids')) return false;
        } else {
          if (t.sport !== selectedSport) return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchVenue = t.venueName?.toLowerCase().includes(q);
        const matchDesc = t.description.toLowerCase().includes(q);
        if (!matchTitle && !matchVenue && !matchDesc) return false;
      }

      return true;
    });
  }, [tournaments, selectedCity, selectedSport, searchQuery]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerModal || !user) return;

    const ok = registerForTournament(
      registerModal.id,
      user.id,
      user.name,
      user.email,
      teamName.trim() || `${user.name}'s Squad`
    );

    if (ok) {
      setRegSuccess(`Successfully registered for ${registerModal.title}! Your digital entry pass is confirmed.`);
      setRegisterModal(null);
      setTeamName('');
      setTimeout(() => setRegSuccess(null), 5000);
    }
  };

  return (
    <div className="container-page py-8 space-y-8 animate-in fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-linear-to-br from-emerald-950 via-slate-900 to-teal-950 p-6 sm:p-10 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-black tracking-wide text-emerald-300 backdrop-blur-md">
            <Trophy className="size-4 text-emerald-400" />
            PLAYO ARENA TOURNAMENTS & EVENTS
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            Compete. Conquer. <br />
            <span className="bg-linear-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              Win Cash Prizes & Glory.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Register your team for verified weekend tournaments across 14 cities. From 7v7 football cups and box cricket leagues to FIFA esports championships and kids sports carnivals.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <CheckCircle2 className="size-4 text-emerald-400" /> Verified Host Venues
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <CheckCircle2 className="size-4 text-emerald-400" /> Transparent Cash Prize Pools
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <CheckCircle2 className="size-4 text-emerald-400" /> Digital Team Entry Pass
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-emerald-600/20 blur-3xl" />
        <div className="absolute -bottom-24 right-1/3 size-80 rounded-full bg-cyan-600/15 blur-3xl" />
      </div>

      {/* Success Notification Alert */}
      {regSuccess && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
          <p className="text-sm font-bold">{regSuccess}</p>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card-shell p-4 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tournaments, cups, leagues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <MapPin className="size-4 text-primary shrink-0" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              aria-label="Filter tournaments by city"
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-bold text-foreground focus:border-primary focus:outline-hidden"
            >
              <option value="All">All Cities</option>
              {indianCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sport filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {sportsFilters.map((f) => {
            const active = selectedSport === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedSport(f.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition ${
                  active
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tournaments Grid */}
      <div className="space-y-4">
        <SectionHeading
          title="Upcoming Competitions & Tournaments"
          subtitle={`Showing ${filteredTournaments.length} open event${filteredTournaments.length === 1 ? '' : 's'}`}
        />

        {filteredTournaments.length === 0 ? (
          <div className="card-shell p-12 text-center space-y-3">
            <Trophy className="size-12 text-muted-foreground mx-auto" />
            <h3 className="font-display text-lg font-black text-foreground">No Tournaments Found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              No tournaments match your current filters. Try switching the city or sport category.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCity('All');
                setSelectedSport('all');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTournaments.map((t) => {
              const spotsLeft = t.maxParticipants - t.currentParticipants;
              const isRegistered = user && t.registrations?.some((r) => r.userId === user.id && r.status === 'registered');

              return (
                <div
                  key={t.id}
                  className="flex flex-col rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300"
                >
                  {/* Card Header Bar */}
                  <div className="bg-linear-to-r from-emerald-900/60 to-slate-900/80 p-4 border-b border-border/60 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-400">
                          {t.sport ? t.sport : t.category ?? 'Tournament'}
                        </span>
                        <span className="rounded-md bg-muted/60 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                          {t.eventType.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="font-display text-base font-black text-foreground leading-snug line-clamp-2">
                        {t.title}
                      </h3>
                    </div>

                    {t.prizePool && t.prizePool > 0 ? (
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold uppercase text-amber-500 block">
                          Prize Pool
                        </span>
                        <span className="font-display text-base font-black text-amber-400">
                          ₹{t.prizePool.toLocaleString()}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col p-5 justify-between gap-4">
                    <div className="space-y-2.5 text-xs text-muted-foreground">
                      <p className="line-clamp-2 leading-relaxed">{t.description}</p>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-emerald-500 shrink-0" />
                          <span>{t.startDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3.5 text-emerald-500 shrink-0" />
                          <span>{t.startTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5 col-span-2">
                          <MapPin className="size-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">
                            {t.venueName}, {t.venueCity}
                          </span>
                        </div>
                      </div>

                      {/* Participant Progress Bar */}
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-muted-foreground">Slots Filled</span>
                          <span className="text-foreground">
                            {t.currentParticipants} / {t.maxParticipants} ({spotsLeft} left)
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{
                              width: `${Math.min(100, (t.currentParticipants / t.maxParticipants) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer Entry Fee & Register CTA */}
                    <div className="flex items-center justify-between border-t border-border/60 pt-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                          Entry Fee
                        </span>
                        <span className="font-display text-base font-black text-foreground">
                          {t.entryFee === 0 ? 'FREE' : `₹${t.entryFee}`}
                        </span>
                      </div>

                      {isRegistered ? (
                        <div className="flex items-center gap-2">
                          <span className="rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-black text-emerald-500">
                            Registered ✓
                          </span>
                          <button
                            onClick={() => cancelRegistration(t.id, user!.id)}
                            className="text-[11px] text-destructive hover:underline font-bold"
                          >
                            Withdraw
                          </button>
                        </div>
                      ) : spotsLeft <= 0 ? (
                        <span className="rounded-xl bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground">
                          Registration Full
                        </span>
                      ) : (
                        <Button
                          tone="primary"
                          onClick={() => setRegisterModal(t)}
                          className="rounded-xl px-4 py-2 text-xs font-black shadow-xs"
                        >
                          Register Now <ArrowRight className="size-3.5 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {registerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-500">
                  Team Registration
                </span>
                <h3 className="font-display text-xl font-black text-foreground">
                  {registerModal.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {registerModal.venueName} · {registerModal.startDate} at {registerModal.startTime}
                </p>
              </div>
              <button
                onClick={() => setRegisterModal(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Team / Squad Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dehradun Dragons"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-hidden"
                />
              </div>

              <div className="rounded-xl bg-muted/50 p-4 space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span>Entry Fee:</span>
                  <span>{registerModal.entryFee === 0 ? 'FREE' : `₹${registerModal.entryFee}`}</span>
                </div>
                {registerModal.prizePool && (
                  <div className="flex justify-between text-amber-500 font-bold">
                    <span>Prize Pool:</span>
                    <span>₹{registerModal.prizePool.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Payment Mode:</span>
                  <span className="font-bold text-foreground">Demo UPI Payment</span>
                </div>
                <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  Note: This is a demo platform registration. No real transaction occurs.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => setRegisterModal(null)}>
                  Cancel
                </Button>
                <Button tone="primary" type="submit">
                  Confirm Registration
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
