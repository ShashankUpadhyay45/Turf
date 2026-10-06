import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Map,
  MapPin,
  Search,
  SlidersHorizontal,
  List,
  Star,
  X,
  Navigation,
  ArrowUpDown,
  LocateFixed,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { TurfCard } from "@/components/TurfCard";
import { Badge, Button } from "@/components/ui";
import { turfs, indianCities } from "@/data/turfs";
import {
  requestCurrentLocation,
  calculateDistance,
  getNearestCity,
  type Coordinates,
} from "@/services/location/locationService";
import { ListingStatusBadge } from "@/features/approval/ListingStatusBadge";
import { VerificationBadge } from "@/features/verification/VerificationBadges";

const schema = z.object({
  q: z.string().optional().catch(""),
  sport: z.string().optional().catch("All sports"),
  city: z.string().optional().catch("All"),
});

export const Route = createFileRoute("/explore")({
  validateSearch: schema,
  head: () => ({
    meta: [
      { title: "Explore Sports Turfs Near You — Playo" },
      {
        name: "description",
        content:
          "Discover, compare, and book cricket, football, badminton, and basketball turfs across 14 cities with exact slot availability.",
      },
    ],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const searchParams = Route.useSearch();
  const [query, setQuery] = useState(searchParams.q ?? "");
  const [selectedCity, setSelectedCity] = useState(searchParams.city ?? "All");
  const [sport, setSport] = useState(searchParams.sport ?? "All sports");
  const [maxDistanceKm, setMaxDistanceKm] = useState(30);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(2500);
  const [minRating, setMinRating] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'sports_turf' | 'indoor_sports' | 'gaming_zone'>('all');
  const [sortBy, setSortBy] = useState<"distance" | "rating" | "price_asc" | "price_desc">("distance");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // User GPS Geolocation State
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  const handleGetCurrentLocation = async () => {
    setIsLocating(true);
    setLocationNotice(null);
    try {
      const coords = await requestCurrentLocation();
      setUserCoords(coords);
      const closestCity = getNearestCity(coords);
      setSelectedCity(closestCity);
      setSortBy("distance");
      setLocationNotice(`Live GPS active! Calibrated to ${closestCity} & sorted nearest first.`);
      setTimeout(() => setLocationNotice(null), 5000);
    } catch (err: any) {
      console.warn("Live location fallback:", err);
      setSelectedCity("Dehradun");
      setSortBy("distance");
      setLocationNotice("GPS unavailable; defaulted to closest city (Dehradun).");
      setTimeout(() => setLocationNotice(null), 4000);
    } finally {
      setIsLocating(false);
    }
  };

  const toggleAmenity = (a: string) => {
    setAmenities((current) =>
      current.includes(a) ? current.filter((x) => x !== a) : [...current, a]
    );
  };

  // Filtered and Sorted Results
  const results = useMemo(() => {
    return turfs
      .filter((t) => t.approvalStatus === "APPROVED")
      .map((t) => {
        // If user GPS is available, calculate exact distance dynamically
        const dynDistance = userCoords
          ? calculateDistance(userCoords.latitude, userCoords.longitude, t.latitude, t.longitude)
          : t.distance ?? 2.5;

        return {
          ...t,
          distance: dynDistance,
        };
      })
      .filter((t) => {
        const matchCity =
          selectedCity === "All" ||
          t.city.toLowerCase() === selectedCity.toLowerCase();

        const matchQuery =
          !query ||
          `${t.name} ${t.area} ${t.city}`.toLowerCase().includes(query.toLowerCase());

        const matchSport =
          sport === "All sports" ||
          t.sports.some((s) => s.toLowerCase() === sport.toLowerCase());

        const matchDistance = (t.distance ?? 0) <= maxDistanceKm;
        const matchPrice = t.pricePerHour <= maxPrice;
        const matchRating = t.rating >= minRating;
        const matchAvailable = !availableOnly || t.available;
        const matchAmenities = amenities.every((a) => t.amenities.includes(a));
        const matchCategory =
          selectedCategory === "all" ||
          t.venueCategory === selectedCategory;

        return (
          matchCity &&
          matchQuery &&
          matchSport &&
          matchCategory &&
          matchDistance &&
          matchPrice &&
          matchRating &&
          matchAvailable &&
          matchAmenities
        );
      })
      .sort((a, b) => {
        if (sortBy === "distance") return (a.distance ?? 0) - (b.distance ?? 0);
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "price_asc") return a.pricePerHour - b.pricePerHour;
        if (sortBy === "price_desc") return b.pricePerHour - a.pricePerHour;
        return 0;
      });
  }, [
    selectedCity,
    selectedCategory,
    query,
    sport,
    maxDistanceKm,
    maxPrice,
    minRating,
    availableOnly,
    amenities,
    sortBy,
    userCoords,
  ]);

  const sportsList = [
    "All sports",
    "Football",
    "Cricket",
    "Badminton",
    "Basketball",
    "Tennis",
    "Pickleball",
    "Table Tennis",
    "Volleyball",
    "Swimming",
    "Squash",
    "Bowling",
    "Arcade",
    "Billiards",
    "Multi-sport",
  ];

  return (
    <div className="container-page py-6 pb-24 md:pb-8 space-y-6">
      {/* Top Search & Location Hero Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
        <div>
          <p className="eyebrow">Discover Venues</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black">EXPLORE SPORTS TURFS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Book verified turf pitches with real-time slot availability, lighting, and instant tickets.
          </p>
        </div>

        {/* Current Location Trigger */}
        <div className="flex items-center gap-2">
          <Button
            variant={userCoords ? "primary" : "secondary"}
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="text-xs font-bold"
          >
            <LocateFixed className={`size-4 mr-1.5 ${isLocating ? "animate-spin" : ""}`} />
            {userCoords ? "Location Calibrated (GPS Active)" : "Use Current Location"}
          </Button>

          <Button
            variant="secondary"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="text-xs md:hidden"
          >
            <SlidersHorizontal className="size-4 mr-1.5" />
            Filters
          </Button>
        </div>
      </div>

      {locationNotice && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-400 animate-in fade-in flex items-center gap-2">
          <CheckCircle className="size-4" />
          {locationNotice}
        </div>
      )}

      {/* Main Search & Quick Sports Chips */}
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_200px_180px]">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by arena name, neighborhood, or sport..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary font-normal"
            />
          </div>

          {/* City Selector */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            aria-label="Select City"
            className="h-11 rounded-xl border border-border bg-card px-3.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All 14 Indian Cities</option>
            {indianCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-bold">
            <ArrowUpDown className="size-3.5 text-muted-foreground shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort by"
              className="h-full w-full bg-transparent outline-none cursor-pointer"
            >
              <option value="distance">Sort: Nearest First</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="price_asc">Sort: Price Low → High</option>
              <option value="price_desc">Sort: Price High → Low</option>
            </select>
          </div>
        </div>

        {/* Major Category Selector Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: '🏟️ All Destinations' },
            { id: 'sports_turf', label: '⚽ Sports Turfs' },
            { id: 'indoor_sports', label: '🏸 Indoor Courts' },
            { id: 'gaming_zone', label: '🎮 Gaming & Fun Zones' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-violet-600 text-white shadow-xs"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sport Tags Carousel */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sportsList.map((s) => (
            <button
              key={s}
              onClick={() => setSport(s)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                sport.toLowerCase() === s.toLowerCase()
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Cards Grid */}
      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        {/* Desktop Sidebar Filters */}
        <aside
          className={`${
            filtersOpen ? "block fixed inset-0 z-50 bg-background p-6 overflow-y-auto" : "hidden"
          } md:block md:static md:bg-transparent md:p-0 space-y-6`}
        >
          {filtersOpen && (
            <div className="flex justify-between items-center pb-4 border-b border-border md:hidden">
              <h3 className="font-display text-2xl font-black">FILTERS</h3>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                <X className="size-6" />
              </button>
            </div>
          )}

          <div className="card-shell p-5 space-y-6">
            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-2">
                <span>Distance Radius</span>
                <span className="text-primary font-black">{maxDistanceKm} km</span>
              </div>
              <input
                type="range"
                min="2"
                max="50"
                value={maxDistanceKm}
                onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center text-xs font-bold mb-2">
                <span>Maximum Hourly Price</span>
                <span className="text-primary font-black">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="400"
                max="2500"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="border-t border-border pt-4">
              <label className="text-xs font-bold block mb-2">Customer Rating</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-xs font-bold"
              >
                <option value="0">Any Star Rating</option>
                <option value="4.5">4.5+ Stars & Up</option>
                <option value="4.7">4.7+ Stars & Up</option>
                <option value="4.8">4.8+ Stars & Up</option>
              </select>
            </div>

            <div className="border-t border-border pt-4">
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="size-4 accent-primary"
                />
                Show Only Available Now
              </label>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <span className="text-xs font-bold block">Key Amenities</span>
              {[
                "Floodlights",
                "Parking",
                "Changing room",
                "Washroom",
                "Drinking water",
                "Equipment rental",
              ].map((am) => (
                <label key={am} className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={amenities.includes(am)}
                    onChange={() => toggleAmenity(am)}
                    className="size-3.5 accent-primary"
                  />
                  {am}
                </label>
              ))}
            </div>

            {filtersOpen && (
              <Button onClick={() => setFiltersOpen(false)} className="w-full mt-4 md:hidden">
                Show {results.length} Turfs
              </Button>
            )}
          </div>
        </aside>

        {/* Results Grid */}
        <main className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>
              Found <strong>{results.length}</strong> available sports grounds
            </span>
            {userCoords && <span>Calibrated by GPS distance</span>}
          </div>

          {results.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((turf) => (
                <TurfCard key={turf.id} turf={turf} />
              ))}
            </div>
          ) : (
            <div className="card-shell p-16 text-center text-muted-foreground space-y-3">
              <MapPin className="mx-auto size-12 opacity-30" />
              <h3 className="font-display text-2xl font-black text-foreground">No Grounds Found</h3>
              <p className="text-xs max-w-md mx-auto">
                No verified venues matched your current search filters. Try broadening your distance radius or city selection.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setSelectedCity("All");
                  setSport("All sports");
                  setMaxDistanceKm(30);
                  setMaxPrice(2500);
                  setMinRating(0);
                  setAvailableOnly(false);
                  setAmenities([]);
                }}
              >
                Reset All Filters
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
