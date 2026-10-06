import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Trophy,
  Users,
  Volleyball,
  CircleDot,
  Layers,
  Gamepad2,
  Waves,
  Sparkles,
  ArrowRight,
  Activity,
  Flame,
} from "lucide-react";
import { Badge, SectionHeading } from "@/components/ui";

export const Route = createFileRoute("/sports")({
  head: () => ({
    meta: [
      { title: "Sports & Activities Directory — Playo" },
      {
        name: "description",
        content:
          "Discover venues for Cricket, Football, Badminton, Basketball, Tennis, Pickleball, Swimming, Table Tennis, Squash, and Gaming Zones.",
      },
      { property: "og:title", content: "Sports & Activities Directory — Playo" },
      {
        property: "og:description",
        content:
          "Discover verified grounds, courts, and gaming centers for 10+ popular sports across India.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SportsPage,
});

interface SportCard {
  id: string;
  name: string;
  category: string;
  description: string;
  highlights: string[];
  sportParam: string;
  icon: typeof Trophy;
  gradient: string;
  textColor: string;
  badge: string;
}

const SPORTS_CATALOG: SportCard[] = [
  {
    id: "cricket",
    name: "CRICKET",
    category: "Pitch, Box & Nets",
    description: "Tournament-grade box cricket courts, bowling machines, and natural pitch strips.",
    highlights: ["Overhead boundary netting", "Spring bounce matting", "Floodlit night boxes"],
    sportParam: "Cricket",
    icon: Trophy,
    gradient: "from-emerald-950 via-emerald-900 to-green-900 border-emerald-700/40",
    textColor: "text-emerald-400",
    badge: "Most Popular",
  },
  {
    id: "football",
    name: "FOOTBALL",
    category: "5v5, 7v7 & 11-a-side",
    description: "Shock-absorbing FIFA artificial turf pitches with professional floodlight towers.",
    highlights: ["European synthetic pile", "Perimeter safety netting", "Team bibs & match balls"],
    sportParam: "Football",
    icon: CircleDot,
    gradient: "from-blue-950 via-blue-900 to-indigo-950 border-blue-700/40",
    textColor: "text-blue-400",
    badge: "Trending",
  },
  {
    id: "badminton",
    name: "BADMINTON",
    category: "Indoor Courts",
    description: "BWF-standard wooden & synthetic rubber flooring with anti-glare overhead lighting.",
    highlights: ["Air-conditioned arenas", "Racket rental available", "Feather shuttlecock approved"],
    sportParam: "Badminton",
    icon: Volleyball,
    gradient: "from-purple-950 via-purple-900 to-violet-950 border-purple-700/40",
    textColor: "text-purple-400",
    badge: "Indoor Comfort",
  },
  {
    id: "basketball",
    name: "BASKETBALL",
    category: "Full & Half Courts",
    description: "Regulation breakaway rims, high-grip maple wood courts, and outdoor 3x3 half-courts.",
    highlights: ["Standard hoop height", "Spectator viewing tiers", "Electronic scoreboard"],
    sportParam: "Basketball",
    icon: Activity,
    gradient: "from-orange-950 via-amber-900 to-yellow-950 border-orange-700/40",
    textColor: "text-amber-400",
    badge: "High Energy",
  },
  {
    id: "tennis",
    name: "TENNIS & PICKLEBALL",
    category: "Clay & Hardcourts",
    description: "Fast-growing paddle sport and traditional tennis courts with regulation nets and coaching.",
    highlights: ["Pickleball paddle rentals", "Clay and synthetic acrylic", "Coaching slots available"],
    sportParam: "Tennis",
    icon: Flame,
    gradient: "from-teal-950 via-teal-900 to-cyan-950 border-teal-700/40",
    textColor: "text-teal-400",
    badge: "Fastest Growing",
  },
  {
    id: "table-tennis",
    name: "TABLE TENNIS",
    category: "Indoor Arenas",
    description: "ITTF-approved competition tables in climate-controlled game centers with anti-slip mats.",
    highlights: ["25mm tournament tops", "Robot ball feed training", "Premium paddle sets"],
    sportParam: "Table Tennis",
    icon: Sparkles,
    gradient: "from-pink-950 via-rose-900 to-red-950 border-rose-700/40",
    textColor: "text-rose-400",
    badge: "Precision Play",
  },
  {
    id: "volleyball",
    name: "VOLLEYBALL",
    category: "Beach Sand & Indoor",
    description: "Deep-sand beach volleyball pits and indoor multi-sport courts for weekend squad battles.",
    highlights: ["Fine silica sand pits", "Adjustable net heights", "Showers & lockers on-site"],
    sportParam: "Volleyball",
    icon: Volleyball,
    gradient: "from-amber-950 via-yellow-900 to-amber-900 border-yellow-700/40",
    textColor: "text-yellow-400",
    badge: "Squad Favorite",
  },
  {
    id: "swimming",
    name: "SWIMMING & POOLS",
    category: "Laps & Heated Pools",
    description: "Certified hygienic pools with certified lifeguards, lane dividers, and night floodlights.",
    highlights: ["Ozone water filtration", "Lifeguard on duty", "Heated indoor options"],
    sportParam: "Swimming",
    icon: Waves,
    gradient: "from-sky-950 via-cyan-900 to-blue-950 border-cyan-700/40",
    textColor: "text-cyan-400",
    badge: "All Season",
  },
  {
    id: "squash",
    name: "SQUASH",
    category: "Glass-Back Courts",
    description: "International standard squash boxes with tempered rear glass and sprung timber flooring.",
    highlights: ["High-rebound wall finish", "Goggle & racket sets", "Championship dimensions"],
    sportParam: "Squash",
    icon: Layers,
    gradient: "from-violet-950 via-indigo-900 to-slate-950 border-violet-700/40",
    textColor: "text-violet-400",
    badge: "Intense Cardio",
  },
  {
    id: "gaming",
    name: "GAMING & ENTERTAINMENT",
    category: "Bowling, VR & Arcade",
    description: "Multi-activity fun zones featuring neon bowling lanes, esports battlestations, and VR pods.",
    highlights: ["Cosmic bowling alleys", "Championship pool tables", "VR racing simulators"],
    sportParam: "Multi-sport",
    icon: Gamepad2,
    gradient: "from-fuchsia-950 via-purple-900 to-indigo-950 border-fuchsia-700/40",
    textColor: "text-fuchsia-400",
    badge: "Recreation Hub",
  },
];

function SportsPage() {
  return (
    <div className="container-page py-6 sm:py-10 pb-24 md:pb-10 space-y-8 sm:space-y-10 animate-in fade-in">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <Badge tone="green">
          <Sparkles className="size-3.5 mr-1" />
          Multi-Sport Marketplace
        </Badge>
        <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight leading-[0.9] text-foreground">
          FIND YOUR SPORT.<br />
          <span className="text-primary">BUILT FOR MATCH DAY.</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          From fast-paced football turfs and box cricket nets to indoor badminton, pickleball,
          squash courts, and full recreation gaming zones — select your game to view verified venues
          and book instantly.
        </p>
      </div>

      {/* Grid of Sports */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SPORTS_CATALOG.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.id}
              to="/explore"
              search={{ sport: s.sportParam, q: "", city: "All" }}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-br ${s.gradient} p-7 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="grid size-12 place-items-center rounded-xl bg-white/10 backdrop-blur-xs text-white">
                    <Icon className="size-6" />
                  </div>
                  <span className={`rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider ${s.textColor}`}>
                    {s.badge}
                  </span>
                </div>

                <div>
                  <span className={`text-xs font-black uppercase tracking-widest ${s.textColor}`}>
                    {s.category}
                  </span>
                  <h2 className="font-display text-3xl font-black tracking-tight mt-0.5">
                    {s.name}
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
                  {s.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  {s.highlights.map((h, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-white/80">
                      <span className={`size-1.5 rounded-full ${s.textColor} bg-current`} />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between pt-4 border-t border-white/15 text-xs font-bold">
                <span className="text-white/90">Find nearby venues</span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Browse <ArrowRight className="size-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
