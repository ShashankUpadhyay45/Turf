import { createFileRoute, notFound, Link, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Star,
  Wifi,
  Car,
  Droplets,
  Lightbulb,
  Navigation,
  Clock,
  IndianRupee,
  MessageSquarePlus,
  Share2,
  ExternalLink,
  Shield,
  Sparkles,
  Info,
  CalendarCheck,
  Users,
  Gamepad2,
  Trophy,
  Play,
  Film,
  Calendar,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Check,
} from "lucide-react";
import { Badge, SectionHeading, Button } from "@/components/ui";
import { BookingPanel } from "@/features/booking/BookingPanel";
import { turfs } from "@/data/turfs";
import { VerificationBadge, VerifiedOwnerBadge } from "@/features/verification/VerificationBadges";
import { useTournamentStore } from "@/store/useTournamentStore";
import { useReviewStore } from "@/store/useReviewStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useState, useMemo } from "react";
import type { GamingActivity } from "@/types";

export const Route = createFileRoute("/turfs/$turfId")({
  loader: ({ params }) => {
    const turf = turfs.find((t) => t.id === params.turfId);
    if (!turf) throw notFound();
    return turf;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Venue"} — Playo` },
      {
        name: "description",
        content: loaderData?.blurb ?? "View venue details, exact slot availability and directions.",
      },
      { property: "og:title", content: `${loaderData?.name ?? "Venue"} — Playo` },
      { property: "og:description", content: loaderData?.blurb ?? "View venue details and availability." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TurfDetailPage,
});

function TurfDetailPage() {
  const turf = Route.useLoaderData();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState<string | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // DYNAMIC REVIEWS FROM STORE: isolated strictly to this exact venue
  const allStoreReviews = useReviewStore((s) => s.reviews);
  const addReviewToStore = useReviewStore((s) => s.addReview);
  const turfReviews = useMemo(
    () => allStoreReviews.filter((r) => r.turfId === turf.id),
    [allStoreReviews, turf.id]
  );

  // Live calculated average rating and count
  const currentRating = useMemo(() => {
    if (turfReviews.length === 0) return turf.rating || 4.8;
    const sum = turfReviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / turfReviews.length) * 10) / 10;
  }, [turfReviews, turf.rating]);
  const currentReviewsCount = turfReviews.length || turf.reviewsCount;

  // Review & Rating submission form states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [selectedSport, setSelectedSport] = useState(turf.sports[0] ?? "football");
  const [guestPlayerName, setGuestPlayerName] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError("");

    const authorName = user?.name || guestPlayerName.trim();
    if (!authorName) {
      setReviewError("Please enter your player name to submit a review.");
      return;
    }

    if (!reviewComment.trim() || reviewComment.trim().length < 5) {
      setReviewError("Please write at least a short review (min 5 characters).");
      return;
    }

    addReviewToStore({
      turfId: turf.id,
      turfName: turf.name,
      userId: user?.id ?? `guest-${Date.now()}`,
      userName: authorName,
      rating: ratingValue,
      comment: reviewComment.trim(),
      sportsPlayed: selectedSport as any,
      isVerifiedPlay: true,
    });

    setReviewSuccess(true);
    setReviewComment("");
    setTimeout(() => {
      setReviewSuccess(false);
      setShowReviewForm(false);
    }, 2500);
  };

  // UPCOMING TOURNAMENTS AT THIS EXACT VENUE
  const allTournaments = useTournamentStore((s) => s.tournaments);
  const venueTournaments = useMemo(
    () =>
      allTournaments.filter(
        (t) =>
          t.venueId === turf.id &&
          (t.status === "registration_open" || t.status === "published" || t.status === "ongoing")
      ),
    [allTournaments, turf.id]
  );

  // Unified Gallery Images
  const galleryImages = useMemo(() => {
    const list = [turf.image];
    if (turf.images && turf.images.length > 0) {
      turf.images.forEach((img) => {
        if (!list.includes(img)) list.push(img);
      });
    }
    return list;
  }, [turf.image, turf.images]);

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${turf.latitude},${turf.longitude}&travelmode=driving`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: turf.name,
        text: `Book slots at ${turf.name} on Playo!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const scrollToBooking = () => {
    const target = document.getElementById("mobile-booking-section");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const isGamingZone = turf.venueCategory === "gaming_zone";

  return (
    <div className="container-page py-4 sm:py-6 pb-32 lg:pb-12 space-y-6 sm:space-y-8 animate-in fade-in">
      {/* 1. DYNAMIC RESPONSIVE PHOTO SHOWCASE */}
      <div className="space-y-2">
        {/* Mobile & Desktop Main Image Stage */}
        <div className="grid gap-3 lg:grid-cols-[1.45fr_.55fr]">
          <div className="group relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[480px] overflow-hidden rounded-2xl bg-muted shadow-md">
            <img
              src={galleryImages[activePhotoIdx] ?? turf.image}
              alt={turf.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
            />
            {/* Ambient vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 lg:to-transparent" />

            {/* Mobile Top Navigation Floating Bar */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 lg:hidden">
              <Link
                to="/explore"
                className="grid size-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md transition active:scale-95"
                title="Back to search"
              >
                <ArrowLeft className="size-4" />
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="grid size-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md transition active:scale-95"
                  title="Share venue"
                >
                  <Share2 className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsSaved(!isSaved)}
                  className={`grid size-9 place-items-center rounded-full bg-black/50 backdrop-blur-md transition active:scale-95 ${
                    isSaved ? "text-rose-500" : "text-white"
                  }`}
                  title="Save favorite"
                >
                  <Heart className={`size-4 ${isSaved ? "fill-current" : ""}`} />
                </button>
              </div>
            </div>

            {/* Mobile Carousel Arrow Controls */}
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIdx((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
                  }}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 grid size-8 sm:size-10 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/75 active:scale-90"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIdx((prev) => (prev + 1) % galleryImages.length);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 grid size-8 sm:size-10 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/75 active:scale-90"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}

            {/* Bottom Badges on Hero */}
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 z-10">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <VerificationBadge status={turf.verificationStatus} size="sm" />
                <Badge tone="green" className="text-[11px] py-0.5 sm:py-1">
                  <CheckCircle2 className="size-3 mr-1" /> Verified
                </Badge>
                {isGamingZone && (
                  <span className="rounded-md bg-violet-600/90 backdrop-blur-xs px-2 py-0.5 text-[11px] font-black text-white">
                    Gaming Hub
                  </span>
                )}
              </div>

              {/* Photo Counter Pill */}
              {galleryImages.length > 1 && (
                <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shrink-0">
                  {activePhotoIdx + 1} / {galleryImages.length}
                </span>
              )}
            </div>
          </div>

          {/* Desktop Right Companion Images */}
          <div className="hidden lg:grid grid-cols-1 gap-3">
            {galleryImages.slice(1, 3).map((img, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setActivePhotoIdx(idx + 1)}
                className={`relative h-full min-h-36 w-full overflow-hidden rounded-2xl cursor-pointer border-2 transition ${
                  activePhotoIdx === idx + 1 ? "border-primary" : "border-transparent opacity-85 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={`Venue view ${idx + 2}`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Horizontal Thumbnail Strip */}
        {galleryImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 pt-1 lg:hidden scrollbar-none">
            {galleryImages.map((img, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setActivePhotoIdx(idx)}
                className={`relative size-16 shrink-0 overflow-hidden rounded-xl border-2 transition cursor-pointer ${
                  activePhotoIdx === idx ? "border-primary shadow-sm scale-102" : "border-border/60 opacity-60"
                }`}
              >
                <img src={img} alt={`Thumb ${idx + 1}`} className="size-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Responsive Ordering */}
      <div className="grid items-start gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_420px] w-full min-w-0 max-w-full overflow-hidden">
        {/* Left Column: Venue Details */}
        <div className="space-y-6 sm:space-y-8 min-w-0 w-full overflow-hidden">
          {/* Header & Badges */}
          <div className="space-y-3 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {turf.sports.map((s) => (
                <Badge key={s} tone={isGamingZone ? "purple" : "blue"} className="text-xs uppercase">
                  {s}
                </Badge>
              ))}
              <span className="text-[11px] text-muted-foreground font-mono">
                Managed by {turf.ownerName ?? "Verified Partner"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 min-w-0">
              <div className="min-w-0">
                <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-tight">
                  {turf.name}
                </h1>
                <p className="mt-1.5 flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm font-medium">
                  <MapPin className="size-4 text-info shrink-0" />
                  <span className="truncate">{turf.address}</span>
                  <span className="text-foreground font-bold shrink-0">· {turf.distance ?? 1.2} km away</span>
                </p>
              </div>

              {/* Rating and Desktop Share Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleShare}
                  className="hidden lg:grid size-10 place-items-center rounded-xl border border-border bg-card hover:bg-muted transition cursor-pointer"
                  title="Share venue"
                  aria-label="Share venue"
                >
                  <Share2 className="size-4 text-muted-foreground" />
                </button>
                {copied && <span className="text-xs text-emerald-400 font-bold hidden lg:inline">Copied!</span>}

                <div className="flex items-center gap-1.5 rounded-xl bg-reward-soft px-3 py-1.5 sm:px-3.5 sm:py-2">
                  <Star className="size-4 fill-current text-reward" />
                  <strong className="text-foreground font-black text-sm">{currentRating}</strong>
                  <span className="text-xs text-muted-foreground">({currentReviewsCount})</span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
              {turf.description || turf.blurb}
            </p>
          </div>

          {/* Trust Score & Quality Guarantee Card (Ultra-responsive on Mobile) */}
          <div className="card-shell p-2.5 sm:p-5 bg-card/60 border border-primary/20 grid grid-cols-4 gap-1.5 sm:gap-4 text-center min-w-0 overflow-hidden">
            <div className="space-y-0.5 min-w-0 overflow-hidden">
              <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold block truncate">
                Trust Score
              </span>
              <p className="font-display text-base sm:text-2xl font-black text-primary truncate">
                {turf.trustScore ?? 98}%
              </p>
              <span className="text-[9px] text-emerald-500 font-bold hidden sm:block truncate">Verified</span>
            </div>
            <div className="space-y-0.5 border-l border-border/50 min-w-0 overflow-hidden">
              <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold block truncate">
                Slot Sync
              </span>
              <p className="font-display text-base sm:text-2xl font-black text-emerald-400 truncate">
                {turf.accuracyScore ?? 99}%
              </p>
              <span className="text-[9px] text-muted-foreground hidden sm:block truncate">No double-book</span>
            </div>
            <div className="space-y-0.5 border-l border-border/50 min-w-0 overflow-hidden">
              <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold block truncate">
                Refund
              </span>
              <p className="font-display text-base sm:text-2xl font-black text-foreground truncate">
                Free
              </p>
              <span className="text-[9px] text-muted-foreground hidden sm:block truncate">Up to 4h prior</span>
            </div>
            <div className="space-y-0.5 border-l border-border/50 min-w-0 overflow-hidden">
              <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold block truncate">
                Audit
              </span>
              <p className="font-display text-base sm:text-2xl font-black text-info truncate">
                100%
              </p>
              <span className="text-[9px] text-muted-foreground hidden sm:block truncate">Specs checked</span>
            </div>
          </div>

          {/* MOBILE BOOKING SECTION (Anchor target for smooth scroll) */}
          <div id="mobile-booking-section" className="block lg:hidden rounded-2xl border border-primary/30 bg-card/95 p-2.5 sm:p-5 shadow-xl scroll-mt-20 w-full min-w-0 max-w-full overflow-hidden">
            <BookingPanel turf={turf} />
          </div>

          {/* DEDICATED GAMING ACTIVITIES (If this is a Multi-Sport Gaming Zone) */}
          {turf.gamingActivities && turf.gamingActivities.length > 0 && (
            <section className="space-y-3.5 rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <Gamepad2 className="size-5 text-violet-500" />
                <h3 className="font-display text-lg sm:text-xl font-black text-foreground">
                  Entertainment & Gaming Attractions
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Flexible booking available per person, per game, or hourly pass. Equipment and safety gear included.
              </p>

              <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2">
                {turf.gamingActivities.map((act) => (
                  <div
                    key={act.id}
                    className="flex flex-col justify-between p-3.5 rounded-xl border border-border/70 bg-card shadow-xs space-y-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-xs sm:text-sm text-foreground truncate">{act.name}</h4>
                        <span className="rounded bg-violet-500/10 px-2 py-0.5 text-[9px] font-black text-violet-500 uppercase shrink-0">
                          {act.type.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-relaxed">
                        {act.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs font-bold text-foreground">
                      <span className="text-muted-foreground text-[11px]">Pass Rate:</span>
                      <span className="text-primary font-black">
                        {act.pricePerPerson
                          ? `₹${act.pricePerPerson}/person`
                          : act.pricePerGame
                            ? `₹${act.pricePerGame}/game`
                            : `₹${act.pricePerHour}/hr`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* UPCOMING TOURNAMENTS AT THIS VENUE */}
          {venueTournaments.length > 0 && (
            <section className="space-y-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="size-5 text-emerald-500" />
                  <h3 className="font-display text-lg sm:text-xl font-black text-foreground">
                    Tournaments at this Arena
                  </h3>
                </div>
                <Link
                  to="/tournaments"
                  className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                >
                  All Events <ArrowRight className="size-3" />
                </Link>
              </div>

              <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2">
                {venueTournaments.map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-col justify-between p-3.5 rounded-xl border border-border/70 bg-card shadow-xs space-y-2.5"
                  >
                    <div>
                      <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-500">
                        {t.sport || "Event"}
                      </span>
                      <h4 className="font-display text-sm font-black text-foreground mt-1">
                        {t.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {t.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Entry:</span>
                        <span className="font-bold text-foreground">
                          {t.entryFee === 0 ? "Free" : `₹${t.entryFee}`}
                        </span>
                      </div>
                      <Link
                        to="/tournaments"
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* PROMOTIONAL VIDEO TOURS */}
          {turf.videos && turf.videos.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Film className="size-4 text-primary" />
                <h3 className="font-display text-base sm:text-lg font-black text-foreground">
                  Virtual Arena Tours & Video Walkthrough
                </h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {turf.videos.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => setActiveVideoModal(vid.url)}
                    className="group relative aspect-16/9 overflow-hidden rounded-xl bg-black cursor-pointer shadow-xs border border-border"
                  >
                    <video
                      src={vid.url}
                      className="size-full object-cover opacity-70 group-hover:scale-105 transition duration-300"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="size-10 sm:size-11 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                        <Play className="size-5 fill-current ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-bold truncate drop-shadow-md">
                      {vid.title}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Location & Directions Card */}
          <section className="card-shell p-4 sm:p-6 bg-secondary/30 border border-primary/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider text-info">
                  Driving Route & GPS Coordinates
                </p>
                <h3 className="text-base sm:text-lg font-black text-foreground mt-0.5">
                  {turf.area}, {turf.city}
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  GPS: {turf.latitude.toFixed(4)}° N, {turf.longitude.toFixed(4)}° E
                </p>
              </div>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-xs sm:text-sm font-bold text-primary-foreground shadow-action transition active:scale-95"
              >
                <Navigation className="size-4" />
                Turn-by-Turn Navigation
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 border-t border-border pt-3.5 text-xs font-bold min-w-0 overflow-hidden">
              <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground min-w-0">
                <Clock className="size-4 text-info shrink-0" />
                <span className="truncate">
                  {turf.operatingHours?.open ?? "06:00 AM"} – {turf.operatingHours?.close ?? "11:00 PM"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                <IndianRupee className="size-4 text-success shrink-0" />
                <span className="truncate">Peak: ₹{turf.peakPricePerHour ?? turf.pricePerHour + 200}/hr</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground col-span-2 sm:col-span-1 min-w-0">
                <ShieldCheck className="size-4 text-primary shrink-0" />
                <span className="truncate">{isGamingZone ? "Climate Controlled" : "European Turf Matting"}</span>
              </div>
            </div>
          </section>

          {/* Amenities Grid */}
          <section className="space-y-3 min-w-0 overflow-hidden">
            <SectionHeading eyebrow="Facility Features" title="AMENITIES & GEAR" />
            <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 w-full min-w-0">
              {turf.amenities.map((a) => (
                <div
                  key={a}
                  className="card-shell flex items-center gap-2 p-2.5 sm:p-4 hover:border-primary/50 transition min-w-0 overflow-hidden"
                >
                  {a.includes("Parking") ? (
                    <Car className="size-4 text-info shrink-0" />
                  ) : a.includes("water") ? (
                    <Droplets className="size-4 text-info shrink-0" />
                  ) : a.includes("light") ? (
                    <Lightbulb className="size-4 text-success shrink-0" />
                  ) : (
                    <Wifi className="size-4 text-success shrink-0" />
                  )}
                  <span className="text-xs sm:text-sm font-bold text-foreground truncate min-w-0">{a}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Verified Player Reviews & Rating Section */}
          <section className="space-y-3.5 min-w-0 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 min-w-0">
              <SectionHeading
                eyebrow="Community Feedback"
                title={`${currentRating} RATING FROM ${currentReviewsCount} MATCHES`}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowReviewForm((prev) => !prev)}
                className="self-start sm:self-auto gap-2 text-xs font-black shadow-xs border border-primary/30 text-primary hover:bg-primary/10 transition shrink-0"
              >
                <MessageSquarePlus className="size-4" />
                {showReviewForm ? "Close Review Form" : "Rate & Review Turf"}
              </Button>
            </div>

            {/* Interactive Review Form */}
            {showReviewForm && (
              <div className="card-shell p-4 sm:p-5 bg-card/90 border-2 border-primary/30 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-black text-foreground">
                      Rate & Review {turf.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Help fellow players in {turf.city} choose the best grounds!
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black text-emerald-500">
                    Verified Player ✓
                  </span>
                </div>

                {reviewSuccess ? (
                  <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-center space-y-1">
                    <p className="font-display font-black text-emerald-500 text-sm sm:text-base flex items-center justify-center gap-1.5">
                      <Check className="size-4" /> Review Published Successfully!
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your rating has been recorded and is now live for all players.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-3.5">
                    {/* Star Rating Selector */}
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1.5">
                        Your Rating: <span className="text-amber-500 font-black">{hoverRating || ratingValue} Stars</span>
                        <span className="text-muted-foreground font-normal ml-1.5">
                          {((hoverRating || ratingValue) === 5 && "— Outstanding Experience!") ||
                            ((hoverRating || ratingValue) === 4 && "— Great Ground & Facilities") ||
                            ((hoverRating || ratingValue) === 3 && "— Average / Satisfactory") ||
                            ((hoverRating || ratingValue) === 2 && "— Needs Improvement") ||
                            " — Poor Experience"}
                        </span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isActive = (hoverRating || ratingValue) >= star;
                          return (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setRatingValue(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="p-1 text-2xl transition hover:scale-125 focus:outline-hidden cursor-pointer"
                              aria-label={`Rate ${star} star`}
                            >
                              <Star
                                className={`size-6 sm:size-7 ${
                                  isActive
                                    ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                                    : "text-muted-foreground/40 hover:text-amber-300"
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sport Played and Player Name */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Sport Played
                        </label>
                        <select
                          value={selectedSport}
                          onChange={(e) => setSelectedSport(e.target.value)}
                          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary focus:outline-hidden"
                        >
                          {turf.sports.map((s) => (
                            <option key={s} value={s}>
                              {s.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Player Name
                        </label>
                        {user ? (
                          <div className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-bold text-foreground flex items-center justify-between">
                            <span>{user.name}</span>
                            <span className="text-[10px] text-emerald-500 font-extrabold">Logged In</span>
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={guestPlayerName}
                            onChange={(e) => setGuestPlayerName(e.target.value)}
                            placeholder="e.g. Rahul Sharma"
                            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-hidden"
                          />
                        )}
                      </div>
                    </div>

                    {/* Review Comment Textarea */}
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">
                        Your Feedback & Details
                      </label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Tell players about turf quality, ball bounce, lighting, parking, drinking water, or booking check-in..."
                        rows={3}
                        className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-hidden leading-relaxed"
                      />
                    </div>

                    {reviewError && (
                      <p className="text-xs font-bold text-destructive">{reviewError}</p>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowReviewForm(false)}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        tone="primary"
                        className="gap-1.5 text-xs font-black shadow-action"
                      >
                        <Check className="size-4" /> Submit Verified Review
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {turfReviews.length === 0 ? (
              <div className="card-shell p-6 text-center text-xs text-muted-foreground">
                No reviews yet for this venue. Be the first to play and review!
              </div>
            ) : (
              <div className="grid gap-2.5 sm:gap-3">
                {turfReviews.map((r) => (
                  <article key={r.id} className="card-shell p-4 sm:p-5 space-y-2 min-w-0 overflow-hidden">
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <strong className="text-foreground text-xs sm:text-sm truncate">{r.userName}</strong>
                        {r.isVerifiedPlay && (
                          <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold shrink-0">
                            Verified ✓
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-amber-400 shrink-0">{"★".repeat(r.rating)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed wrap-break-words">{r.comment}</p>
                    {r.ownerResponse && (
                      <div className="rounded-lg bg-secondary/50 p-2.5 text-xs border border-primary/20 space-y-0.5 ml-2">
                        <p className="font-bold text-primary text-[11px]">Response from {turf.name}:</p>
                        <p className="text-muted-foreground">{r.ownerResponse.message}</p>
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground font-mono pt-0.5">
                      Played {r.sportsPlayed.toUpperCase()} · {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* CANCELLATION POLICY AT THE VERY END */}
          <section className="card-shell p-4 sm:p-5 bg-card/40 space-y-1.5 border-l-4 border-l-primary">
            <h3 className="font-display text-sm sm:text-base font-bold flex items-center gap-2 text-foreground">
              <Info className="size-4 text-primary" /> Cancellation & Refund Policy
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {turf.cancellationPolicy ??
                "100% full refund available up to 4 hours before kickoff. 50% refund up to 2 hours prior. Instant refund back to your original payment method."}
            </p>
          </section>
        </div>

        {/* Desktop Sticky Booking Sidebar (Hidden on mobile) */}
        <aside className="sticky top-24 hidden lg:block">
          <BookingPanel turf={turf} />
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground font-semibold">
            <ShieldCheck className="size-4 text-success" />
            Double-booking prevention active · 10-min hold
          </div>
        </aside>
      </div>

      {/* DYNAMIC SMARTPHONE STICKY BOOKING ACTION BAR (Floating above bottom navigation) */}
      <div className="fixed bottom-16 inset-x-0 z-40 bg-card/95 backdrop-blur-md border-t border-border px-4 py-2.5 flex items-center justify-between lg:hidden shadow-2xl animate-in slide-in-from-bottom-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Match Fee
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-foreground">
              ₹{turf.pricePerHour}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">
              {turf.bookingUnit === "per_person" ? "/person" : "/hr"}
            </span>
            <span className="text-[11px] font-bold text-amber-500 ml-1">
              ★ {currentRating}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={scrollToBooking}
          className="rounded-xl bg-primary px-5 py-2.5 text-xs font-black text-primary-foreground shadow-action hover:bg-primary/90 transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <Calendar className="size-4" />
          <span>Book Match Slot</span>
        </button>
      </div>

      {/* Video Preview Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-2xl relative">
            <button
              onClick={() => setActiveVideoModal(null)}
              className="absolute top-3 right-3 z-10 size-8 rounded-full bg-black/70 text-white flex items-center justify-center font-bold hover:bg-black"
            >
              ✕
            </button>
            <video
              src={activeVideoModal}
              controls
              autoPlay
              className="w-full aspect-16/9 object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
