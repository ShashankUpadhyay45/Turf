import { useNavigate } from "@tanstack/react-router";
import { LocateFixed, Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui";
import { requestCurrentLocation, getNearestCity } from "@/services/location/locationService";

export function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("Dehradun");
  const [sport, setSport] = useState("All sports");
  const [isLocating, setIsLocating] = useState(false);
  const [locationFeedback, setLocationFeedback] = useState<string | null>(null);

  const handleLiveLocation = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLocating(true);
    setLocationFeedback(null);

    try {
      const coords = await requestCurrentLocation();
      const detectedCity = getNearestCity(coords);
      setQuery(detectedCity);
      setLocationFeedback(`Located: ${detectedCity}`);
      setTimeout(() => setLocationFeedback(null), 3000);
      navigate({
        to: "/explore",
        search: {
          q: detectedCity,
          city: detectedCity,
          sport,
        },
      });
    } catch (err: any) {
      console.warn("Live location error:", err);
      // Graceful fallback to default metro
      setQuery("Dehradun");
      setLocationFeedback("GPS unavailable; defaulted to Dehradun");
      setTimeout(() => setLocationFeedback(null), 3500);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/explore",
      search: {
        q: query,
        sport,
      },
    });
  };

  return (
    <div className="space-y-1.5 w-full">
      <form
        onSubmit={handleSubmit}
        className="grid gap-2 rounded-xl border border-border bg-card p-2 shadow-xl md:grid-cols-[minmax(0,1fr)_190px_auto]"
      >
        <label className="flex min-w-0 items-center gap-3 px-3">
          <Search className="size-5 shrink-0 text-info" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search turf, area or location"
            className="h-12 min-w-0 flex-1 bg-transparent text-sm font-medium outline-none text-foreground placeholder:text-muted-foreground"
            placeholder="Search venue, city, or neighborhood..."
          />
          <button
            type="button"
            onClick={handleLiveLocation}
            disabled={isLocating}
            title="Use Live GPS Location"
            aria-label="Use Live GPS Location"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-2.5 py-1.5 text-xs font-bold text-foreground transition hover:bg-primary hover:text-primary-foreground cursor-pointer shrink-0 disabled:opacity-50"
          >
            {isLocating ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              <LocateFixed className="size-4 text-primary" />
            )}
            <span className="hidden sm:inline">Live GPS</span>
          </button>
        </label>

        <select
          aria-label="Select sport"
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          className="h-12 rounded-lg border border-border bg-muted/50 px-3 text-xs sm:text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        >
          <option value="All sports">All Sports & Activities</option>
          <option value="Cricket">Cricket & Box Nets</option>
          <option value="Football">Football Turfs</option>
          <option value="Badminton">Badminton Courts</option>
          <option value="Basketball">Basketball Arenas</option>
          <option value="Tennis">Tennis & Pickleball</option>
          <option value="Table Tennis">Table Tennis</option>
          <option value="Volleyball">Volleyball</option>
          <option value="Swimming">Swimming & Pools</option>
          <option value="Squash">Squash Courts</option>
          <option value="Gaming & Fun">Gaming & Entertainment</option>
          <option value="Multi-sport">Multi-Sport Venues</option>
        </select>

        <Button type="submit" tone="primary" className="h-12 px-7 font-black rounded-lg">
          <Search className="size-4 mr-1.5" />
          Search
        </Button>
      </form>

      {locationFeedback && (
        <p className="text-[11px] font-bold text-emerald-500 pl-3 animate-in fade-in">
          ✓ {locationFeedback}
        </p>
      )}
    </div>
  );
}
