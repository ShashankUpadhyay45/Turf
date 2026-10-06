import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import {
  Gamepad2,
  Sparkles,
  Trophy,
  Users,
  Search,
  MapPin,
  Clock,
  Star,
  ArrowRight,
  Filter,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { Badge, Button, SectionHeading } from '@/components/ui';
import { gamingZones } from '@/data/gamingZones';
import { indianCities } from '@/data/turfs';
import type { GamingActivity } from '@/types';

export const Route = createFileRoute('/gaming-zones')({
  head: () => ({
    meta: [
      { title: 'Multi-Sport Gaming Zones & Entertainment Hubs — Playo' },
      {
        name: 'description',
        content: 'Discover and book premier arcade, bowling, VR experiences, laser tag, billiards, and esports arenas across India.',
      },
    ],
  }),
  component: GamingZonesPage,
});

const ACTIVITY_FILTERS: Array<{ id: string; label: string; type?: GamingActivity }> = [
  { id: 'all', label: 'All Activities' },
  { id: 'vr_zone', label: '🥽 VR Experiences', type: 'vr_zone' },
  { id: 'bowling', label: '🎳 Cosmic Bowling', type: 'bowling' },
  { id: 'arcade', label: '🕹️ Retro & Modern Arcade', type: 'arcade' },
  { id: 'laser_tag', label: '🔫 Laser Tag Arena', type: 'laser_tag' },
  { id: 'billiards', label: '🎱 Pool & Snooker', type: 'billiards' },
  { id: 'esports', label: '💻 Esports & PC Gaming', type: 'esports' },
  { id: 'racing_simulator', label: '🏎️ Motion Simulators', type: 'racing_simulator' },
  { id: 'trampoline', label: '🤸 Trampoline Park', type: 'trampoline' },
  { id: 'kids_play', label: '🧸 Kids Play Zone', type: 'kids_play' },
];

function GamingZonesPage() {
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedActivity, setSelectedActivity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredVenues = useMemo(() => {
    return gamingZones.filter((venue) => {
      // City filter
      if (selectedCity !== 'All' && venue.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = venue.name.toLowerCase().includes(q);
        const matchArea = venue.area.toLowerCase().includes(q);
        const matchActivities = venue.gamingActivities?.some((a) =>
          a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
        );
        if (!matchName && !matchArea && !matchActivities) return false;
      }

      // Activity filter
      if (selectedActivity !== 'all') {
        const hasActivity = venue.gamingActivities?.some((a) => a.type === selectedActivity);
        if (!hasActivity) return false;
      }

      return true;
    });
  }, [selectedCity, selectedActivity, searchQuery]);

  return (
    <div className="container-page py-8 space-y-8 animate-in fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-linear-to-br from-indigo-950 via-slate-900 to-violet-950 p-6 sm:p-10 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1 text-xs font-black tracking-wide text-violet-300 backdrop-blur-md">
            <Gamepad2 className="size-4 text-violet-400" />
            MULTI-SPORT GAMING & ENTERTAINMENT
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            Level Up Your Game. <br />
            <span className="bg-linear-to-r from-violet-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
              Arcade, VR, Bowling & Esports.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Step beyond conventional pitches into state-of-the-art entertainment destinations. Book high-spec PC battlestations, cosmic bowling lanes, immersive VR simulations, and laser tag arenas for you and your squad.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <CheckCircle2 className="size-4 text-emerald-400" /> Hourly & Per-Person Pricing
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <CheckCircle2 className="size-4 text-emerald-400" /> Corporate & Birthday Packages
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <CheckCircle2 className="size-4 text-emerald-400" /> Instant Digital Gate Passes
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -bottom-24 right-1/3 size-80 rounded-full bg-pink-600/15 blur-3xl" />
      </div>

      {/* Filter and Search Bar */}
      <div className="card-shell p-4 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search gaming zones, VR, bowling, arcade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* City selector */}
          <div className="flex items-center gap-2 shrink-0">
            <MapPin className="size-4 text-primary shrink-0" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              aria-label="Filter gaming zones by city"
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

        {/* Horizontal Activity Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {ACTIVITY_FILTERS.map((f) => {
            const active = selectedActivity === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedActivity(f.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition ${
                  active
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Venues Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeading
            title="Entertainment & Gaming Hubs"
            subtitle={`Showing ${filteredVenues.length} destination${filteredVenues.length === 1 ? '' : 's'}`}
          />
        </div>

        {filteredVenues.length === 0 ? (
          <div className="card-shell p-12 text-center space-y-3">
            <Gamepad2 className="size-12 text-muted-foreground mx-auto" />
            <h3 className="font-display text-lg font-black text-foreground">No Gaming Zones Found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              We couldn't find any gaming hubs matching your filters. Try selecting "All Cities" or switching activity tags.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCity('All');
                setSelectedActivity('all');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredVenues.map((venue) => (
              <div
                key={venue.id}
                className="group flex flex-col rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs hover:border-violet-500/50 hover:shadow-xl transition-all duration-300"
              >
                {/* Image & Badges */}
                <div className="relative aspect-16/9 overflow-hidden bg-muted">
                  <img
                    src={venue.image}
                    alt={venue.name}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="rounded-md bg-violet-600/90 px-2 py-0.5 text-[11px] font-black text-white shadow-xs backdrop-blur-xs">
                      Gaming Zone
                    </span>
                    <span className="rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-xs">
                      {venue.indoorOutdoor === 'indoor' ? 'Indoor AC' : 'All Weather'}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-black text-amber-400 backdrop-blur-xs">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    {venue.rating} ({venue.reviewsCount})
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-display text-lg font-black leading-tight drop-shadow-sm truncate">
                      {venue.name}
                    </h3>
                    <p className="flex items-center gap-1 text-xs text-slate-300 drop-shadow-sm">
                      <MapPin className="size-3 text-violet-400 shrink-0" />
                      {venue.area}, {venue.city}
                    </p>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col p-5 justify-between gap-4">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {venue.blurb}
                  </p>

                  {/* Activity Highlights */}
                  {venue.gamingActivities && venue.gamingActivities.length > 0 && (
                    <div className="space-y-1.5 border-t border-border/50 pt-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                        Featured Activities:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {venue.gamingActivities.slice(0, 4).map((act) => (
                          <span
                            key={act.id}
                            className="rounded-md bg-violet-500/10 px-2 py-0.5 text-[11px] font-bold text-violet-600 dark:text-violet-300"
                          >
                            {act.name}
                          </span>
                        ))}
                        {venue.gamingActivities.length > 4 && (
                          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                            +{venue.gamingActivities.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer Price & Booking CTA */}
                  <div className="flex items-center justify-between border-t border-border/60 pt-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Starts from
                      </span>
                      <span className="font-display text-lg font-black text-foreground">
                        ₹{venue.pricePerHour}
                        <span className="text-xs font-normal text-muted-foreground">/hr</span>
                      </span>
                    </div>

                    <Link
                      to="/turfs/$turfId"
                      params={{ turfId: venue.id }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 px-4 py-2 text-xs font-black text-white shadow-xs transition hover:scale-105"
                    >
                      View Hub <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
