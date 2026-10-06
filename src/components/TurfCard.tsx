import { Link } from "@tanstack/react-router";
import { Building2, CheckCircle2, Heart, MapPin, Star } from "lucide-react";
import type { Turf } from "@/types/turf";
import { useAppStore } from "@/store/useAppStore";
import { Badge } from "./ui";

export function TurfCard({ turf }: { turf: Turf }) {
  const favorites = useAppStore((s) => s.favorites);
  const toggle = useAppStore((s) => s.toggleFavorite);
  const fav = favorites.includes(turf.id);

  return (
    <article className="card-shell group overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={turf.image}
          alt={`${turf.name} playing field`}
          width={1536}
          height={1024}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <button
          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          onClick={() => toggle(turf.id)}
          className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-card/90 shadow-sm backdrop-blur cursor-pointer"
        >
          <Heart className={`size-5 ${fav ? "fill-current text-destructive" : "text-foreground"}`} />
        </button>
        <div className="absolute bottom-3 left-3 flex gap-2">
          <Badge tone="green">
            <CheckCircle2 className="size-3" />
            Verified
          </Badge>
          {turf.available && <Badge tone="blue">Slots today</Badge>}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-2xl font-extrabold">{turf.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-4 text-info" />
              {turf.area} · <strong className="text-foreground">{turf.distance} km</strong>
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground font-semibold">
              <Building2 className="size-3.5 text-primary shrink-0" />
              <span className="truncate">By {turf.ownerName ?? "Verified Partner"}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 text-sm font-extrabold">
            <Star className="size-4 fill-current text-reward" />
            {turf.rating}
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Starts at</p>
            <p className="text-lg font-extrabold">
              ₹{turf.pricePerHour}
              <span className="text-xs font-medium text-muted-foreground"> / hour</span>
            </p>
          </div>
          <Link
            to="/turfs/$turfId"
            params={{ turfId: turf.id }}
            className="rounded-md bg-foreground px-4 py-2.5 text-sm font-bold text-background transition hover:bg-primary hover:text-primary-foreground"
          >
            View turf
          </Link>
        </div>
      </div>
    </article>
  );
}
