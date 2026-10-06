import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarCheck,
  Check,
  ChevronRight,
  IndianRupee,
  Clock3,
  ImagePlus,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wrench,
  Ban,
  Unlock,
  Layers,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useState, useMemo } from "react";
import { ActionLink, Badge, Button, SectionHeading } from "@/components/ui";
import { turfs as initialTurfs, slots as baseSlots } from "@/data/turfs";
import { useAvailabilityStore } from "@/store/useAvailabilityStore";
import { useBookingStore } from "@/store/useBookingStore";
import { useAuthStore } from "@/store/useAuthStore";

/* =========================================================================
   OWNER DASHBOARD (KPIS, LIVE METRICS, QUICK AVAILABILITY)
   ========================================================================= */
export function OwnerDashboard() {
  const user = useAuthStore((s) => s.user);
  const bookings = useBookingStore((s) => s.bookings);
  const getSlots = useAvailabilityStore((s) => s.getSlots);

  const todayIso = new Date().toISOString().split("T")[0]!;
  const todaySlots = useMemo(
    () => getSlots("champions-arena", todayIso),
    [getSlots, todayIso]
  );

  const availableSlotsCount = todaySlots.filter((s) => s.status === "available").length;
  const bookedSlotsCount = todaySlots.filter((s) => s.status === "booked").length;
  const maintenanceSlotsCount = todaySlots.filter((s) => s.status === "maintenance").length;

  const stats = [
    {
      icon: Layers,
      label: "Total Turfs",
      value: "3 Arenas",
      desc: "Champions, Skyline, Greenfield",
      tone: "info",
    },
    {
      icon: CalendarCheck,
      label: "Today's Bookings",
      value: `${bookedSlotsCount + 3}`,
      desc: "Live & upcoming games",
      tone: "success",
    },
    {
      icon: Clock3,
      label: "Available Slots",
      value: `${availableSlotsCount}`,
      desc: `Of ${todaySlots.length} daily slots`,
      tone: "info",
    },
    {
      icon: Users,
      label: "Booked Slots",
      value: `${bookedSlotsCount}`,
      desc: "Occupied today",
      tone: "gold",
    },
    {
      icon: IndianRupee,
      label: "Revenue",
      value: "₹84,650",
      desc: "+18% vs last month",
      tone: "success",
    },
  ];

  return (
    <div className="container-page py-10">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div>
          <p className="eyebrow">Owner Workspace</p>
          <h1 className="font-display text-5xl font-black">
            GOOD MORNING, {user?.name ?? "CHAMPIONS"}.
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your ground availability, block slots, and track daily occupancy.
          </p>
        </div>
        <div className="flex gap-2">
          <ActionLink to="/owner/slots" variant="primary">
            <Layers className="size-4" />
            Manage Slots
          </ActionLink>
          <ActionLink to="/owner/add-turf" variant="dark" className="hidden sm:inline-flex">
            Add Turf
          </ActionLink>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <article key={s.label} className="card-shell p-4 border hover:border-primary transition">
              <Icon className="size-5 text-info" />
              <p className="mt-3 text-xs text-muted-foreground">{s.label}</p>
              <p className="font-display text-3xl font-extrabold">{s.value}</p>
              <p className="text-xs font-bold text-success mt-1">{s.desc}</p>
            </article>
          );
        })}
      </div>

      {/* Charts & Analytics */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
        <section className="card-shell p-6">
          <div className="flex justify-between">
            <div>
              <p className="eyebrow">Weekly Occupancy</p>
              <h2 className="font-display text-3xl font-extrabold">
                78 games scheduled this week
              </h2>
            </div>
            <BarChart3 className="size-6 text-info" />
          </div>
          <div className="mt-8 flex h-52 items-end gap-3">
            {[48, 62, 57, 80, 92, 100, 74].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-sm bg-info-soft" style={{ height: `${h}%` }}>
                  <div className="h-full w-full rounded-t-sm bg-info opacity-80" />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="card-shell p-6 flex flex-col justify-between">
          <div>
            <p className="eyebrow">Peak Hours</p>
            <h2 className="font-display text-3xl font-extrabold">07:00 – 10:00 PM</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              92% peak occupancy this month.
            </p>
            <div className="mt-6 grid gap-3">
              {[
                ["Football 7-a-side", "64%"],
                ["Box Cricket", "36%"],
              ].map(([x, v]) => (
                <div key={x}>
                  <div className="flex justify-between text-xs font-bold">
                    <span>{x}</span>
                    <span>{v}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: v }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <ActionLink to="/owner/slots" variant="secondary" className="mt-6 w-full text-xs">
            Configure Slot Pricing
          </ActionLink>
        </section>
      </div>

      {/* Embedded Live Slot Quick Control */}
      <section className="mt-8">
        <OwnerSlotsView turfId="champions-arena" />
      </section>

      {/* Upcoming Bookings */}
      <section className="mt-10">
        <SectionHeading
          eyebrow="Schedule"
          title="Upcoming Player Bookings"
          action={
            <Link to="/owner/bookings" className="text-sm font-bold text-primary hover:underline">
              View all bookings →
            </Link>
          }
        />
        <div className="card-shell divide-y divide-border">
          {[
            ["PL-084", "07:00 PM", "Ayush Player", "Football", "₹800", "Confirmed"],
            ["PL-085", "08:00 PM", "Weekend Warriors", "Cricket", "₹650", "Confirmed"],
            ["PL-086", "09:00 PM", "North Stars", "Football", "₹800", "Pending"],
            ["PL-087", "10:00 PM", "Doon Strikers", "Cricket", "₹700", "Confirmed"],
          ].map((r) => (
            <div
              key={r[0]}
              className="grid grid-cols-[100px_1fr_auto_auto] items-center gap-4 p-4 text-sm"
            >
              <strong className="text-foreground">{r[1]}</strong>
              <div>
                <p className="font-bold text-foreground">{r[2]}</p>
                <p className="text-xs text-muted-foreground">
                  Ref #{r[0]} · {r[3]}
                </p>
              </div>
              <strong className="font-display text-lg">{r[4]}</strong>
              <Badge tone={r[5] === "Confirmed" ? "green" : "gold"}>{r[5]}</Badge>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* =========================================================================
   OWNER SLOTS MANAGEMENT COMPONENT (BLOCK, UNBLOCK, MAINTENANCE)
   ========================================================================= */
export function OwnerSlotsView({ turfId: defaultTurfId }: { turfId?: string }) {
  const [selectedTurfId, setSelectedTurfId] = useState(defaultTurfId ?? "champions-arena");

  // Rolling 7 days
  const dates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return {
        iso: d.toISOString().split("T")[0]!,
        label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        weekday: d.toLocaleDateString("en-IN", { weekday: "short" }),
      };
    });
  }, []);

  const [selectedDate, setSelectedDate] = useState(dates[0]!.iso);
  const [feedback, setFeedback] = useState<string | null>(null);

  const getSlots = useAvailabilityStore((s) => s.getSlots);
  const blockSlot = useAvailabilityStore((s) => s.blockSlot);
  const unblockSlot = useAvailabilityStore((s) => s.unblockSlot);
  const setMaintenance = useAvailabilityStore((s) => s.setMaintenance);
  const clearMaintenance = useAvailabilityStore((s) => s.clearMaintenance);

  const currentSlots = useMemo(
    () => getSlots(selectedTurfId, selectedDate),
    [getSlots, selectedTurfId, selectedDate]
  );

  const showNotice = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="card-shell p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <Badge tone="blue">
            <Layers className="size-3" />
            LIVE AVAILABILITY CONTROL
          </Badge>
          <h2 className="mt-2 font-display text-3xl font-black">
            SLOT AVAILABILITY MANAGER
          </h2>
          <p className="text-xs text-muted-foreground">
            Any changes made here are instantly reflected in the player booking interface.
          </p>
        </div>

        {/* Turf Selector */}
        <select
          value={selectedTurfId}
          onChange={(e) => setSelectedTurfId(e.target.value)}
          aria-label="Select turf to manage"
          className="h-10 rounded-md border border-border bg-card px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary"
        >
          {initialTurfs.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.area})
            </option>
          ))}
        </select>
      </div>

      {feedback && (
        <div className="mt-4 flex items-center gap-2 rounded-md bg-secondary border border-primary/40 p-3 text-xs font-bold text-foreground animate-in fade-in">
          <CheckCircle2 className="size-4 text-primary" />
          {feedback}
        </div>
      )}

      {/* Date Tabs */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {dates.map((d) => (
          <button
            key={d.iso}
            onClick={() => setSelectedDate(d.iso)}
            className={`flex flex-col min-w-20 items-center justify-center rounded-lg border p-2.5 transition text-xs font-bold ${
              selectedDate === d.iso
                ? "border-primary bg-secondary text-foreground shadow-sm"
                : "border-border bg-card text-muted-foreground hover:border-primary/40"
            }`}
          >
            <span className="text-[10px] text-muted-foreground">{d.weekday}</span>
            <span className="text-sm font-extrabold">{d.label}</span>
          </button>
        ))}
      </div>

      {/* Slots Table / Grid */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[650px]">
          <thead className="bg-muted text-xs text-muted-foreground">
            <tr>
              <th className="p-3.5">Time Slot</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Player / Ref</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {currentSlots.map((slot) => {
              const isAvailable = slot.status === "available";
              const isBooked = slot.status === "booked";
              const isHeld = slot.status === "held";
              const isMaintenance = slot.status === "maintenance";
              const isUnavailable = slot.status === "unavailable";

              return (
                <tr key={slot.id} className="hover:bg-muted/30 transition">
                  <td className="p-3.5 font-extrabold text-foreground">
                    {slot.startTime} – {slot.endTime}
                  </td>
                  <td className="p-3.5">
                    <Badge
                      tone={
                        isAvailable
                          ? "green"
                          : isBooked
                            ? "neutral"
                            : isMaintenance
                              ? "blue"
                              : "gold"
                      }
                    >
                      {slot.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-xs text-muted-foreground">
                    {slot.bookingId ? `#${slot.bookingId}` : "—"}
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    {isAvailable && (
                      <>
                        <button
                          onClick={() => {
                            blockSlot(selectedTurfId, selectedDate, slot.startTime);
                            showNotice(`Slot ${slot.startTime} has been BLOCKED.`);
                          }}
                          className="inline-flex items-center gap-1 rounded bg-muted px-2.5 py-1 text-xs font-bold text-foreground hover:bg-muted/80 transition"
                        >
                          <Ban className="size-3" /> Block
                        </button>
                        <button
                          onClick={() => {
                            setMaintenance(selectedTurfId, selectedDate, slot.startTime);
                            showNotice(`Slot ${slot.startTime} marked for MAINTENANCE.`);
                          }}
                          className="inline-flex items-center gap-1 rounded bg-info-soft px-2.5 py-1 text-xs font-bold text-info hover:bg-info-soft/80 transition"
                        >
                          <Wrench className="size-3" /> Maintenance
                        </button>
                      </>
                    )}

                    {isUnavailable && (
                      <>
                        <button
                          onClick={() => {
                            unblockSlot(selectedTurfId, selectedDate, slot.startTime);
                            showNotice(`Slot ${slot.startTime} is now AVAILABLE for players.`);
                          }}
                          className="inline-flex items-center gap-1 rounded bg-success-soft px-2.5 py-1 text-xs font-bold text-success hover:bg-success-soft/80 transition"
                        >
                          <Unlock className="size-3" /> Unblock
                        </button>
                        <button
                          onClick={() => {
                            setMaintenance(selectedTurfId, selectedDate, slot.startTime);
                            showNotice(`Slot ${slot.startTime} switched to MAINTENANCE.`);
                          }}
                          className="inline-flex items-center gap-1 rounded bg-info-soft px-2.5 py-1 text-xs font-bold text-info hover:bg-info-soft/80 transition"
                        >
                          <Wrench className="size-3" /> Maintenance
                        </button>
                      </>
                    )}

                    {isMaintenance && (
                      <>
                        <button
                          onClick={() => {
                            clearMaintenance(selectedTurfId, selectedDate, slot.startTime);
                            showNotice(`Maintenance cleared for ${slot.startTime}. Slot is AVAILABLE.`);
                          }}
                          className="inline-flex items-center gap-1 rounded bg-success-soft px-2.5 py-1 text-xs font-bold text-success hover:bg-success-soft/80 transition"
                        >
                          <Check className="size-3" /> Clear Maintenance
                        </button>
                        <button
                          onClick={() => {
                            blockSlot(selectedTurfId, selectedDate, slot.startTime);
                            showNotice(`Slot ${slot.startTime} switched to BLOCKED.`);
                          }}
                          className="inline-flex items-center gap-1 rounded bg-muted px-2.5 py-1 text-xs font-bold text-foreground hover:bg-muted/80 transition"
                        >
                          <Ban className="size-3" /> Block
                        </button>
                      </>
                    )}

                    {isBooked && (
                      <button
                        onClick={() => {
                          unblockSlot(selectedTurfId, selectedDate, slot.startTime);
                          showNotice(`Booking released for ${slot.startTime}. Slot is AVAILABLE.`);
                        }}
                        className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-500 hover:bg-rose-500/20 transition"
                        title="Release match booking"
                      >
                        Release to Available
                      </button>
                    )}

                    {isHeld && (
                      <span className="text-xs text-reward font-semibold">
                        Cart Hold (Checkout in progress)
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================================
   OWNER BOOKINGS TABLE
   ========================================================================= */
export function OwnerBookings() {
  const bookings = useBookingStore((s) => s.bookings);

  return (
    <div className="container-page py-10">
      <SectionHeading
        eyebrow="Operations"
        title="MANAGE BOOKINGS"
        body="All incoming player reservations across all your listed sports grounds."
      />

      <div className="card-shell overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-muted text-xs text-muted-foreground">
            <tr>
              <th className="p-4">Booking Ref</th>
              <th className="p-4">Turf Name</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4">Sport</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.length > 0 ? (
              bookings.map((b) => (
                <tr key={b.id} className="hover:bg-muted/30 transition">
                  <td className="p-4 font-mono font-bold text-xs text-foreground">
                    #{b.id}
                  </td>
                  <td className="p-4 font-bold">{b.turfName}</td>
                  <td className="p-4 text-muted-foreground">
                    {b.date} · {b.startTime}
                  </td>
                  <td className="p-4">
                    <Badge tone="blue">{b.sport.toUpperCase()}</Badge>
                  </td>
                  <td className="p-4 font-extrabold">₹{b.finalPrice}</td>
                  <td className="p-4 text-xs text-muted-foreground">{b.paymentMethod}</td>
                  <td className="p-4">
                    <Badge tone={b.status === "confirmed" ? "green" : "neutral"}>
                      {b.status.toUpperCase()}
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No bookings found yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================================
   ADD TURF WIZARD (7 STEPS WITH WORKING SUBMISSION)
   ========================================================================= */
export function AddTurfPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: "Champions Arena II",
    description: "New floodlit synthetic turf with modern locker rooms.",
    sports: ["cricket", "football"],
    address: "Mussoorie Diversion, Rajpur Road",
    area: "Rajpur Road",
    city: "Dehradun",
    pincode: "248001",
    hourlyPrice: "700",
    peakPrice: "900",
    weekendPrice: "850",
    amenities: ["Floodlights", "Parking", "Changing room", "Washroom", "Drinking water"],
  });

  const steps = ["Basics", "Location", "Pricing", "Amenities", "Images", "Schedule", "Preview"];

  const handleFinish = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="container-page py-16 grid place-items-center">
        <div className="card-shell p-10 max-w-lg text-center space-y-4">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-success-soft text-success">
            <CheckCircle2 className="size-10" />
          </div>
          <h2 className="font-display text-4xl font-black">TURF SUBMITTED FOR REVIEW!</h2>
          <p className="text-sm text-muted-foreground">
            Your listing for <strong>{formData.name}</strong> has been created and sent to the Playo administration team for fast-track verification.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <ActionLink to="/owner" variant="primary">
              Return to Dashboard
            </ActionLink>
            <ActionLink to="/owner/slots" variant="secondary">
              Configure Slots
            </ActionLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <p className="eyebrow">New Listing Wizard</p>
      <h1 className="font-display text-5xl font-black">ADD YOUR TURF.</h1>

      <div className="mt-7 flex gap-2 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i + 1)}
            className={`min-w-28 rounded-md border px-3 py-3 text-xs font-bold transition ${
              step === i + 1 ? "border-primary bg-secondary" : "border-border bg-card"
            }`}
          >
            <span className="mr-2 text-muted-foreground">{i + 1}</span>
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="card-shell min-h-[460px] p-6 md:p-8">
          {step === 1 && (
            <div>
              <h2 className="font-display text-3xl font-extrabold">Basic information</h2>
              <div className="mt-6 grid gap-4">
                <label className="grid gap-1 text-sm font-bold">
                  Turf name
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 rounded-md border border-input bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. Champions Arena"
                  />
                </label>
                <label className="grid gap-1 text-sm font-bold">
                  Description
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-28 rounded-md border border-input bg-background p-3 font-normal outline-none focus:ring-2 focus:ring-primary"
                    placeholder="What makes this ground special?"
                  />
                </label>
                <div>
                  <p className="text-sm font-bold">Sports supported</p>
                  <div className="mt-2 flex gap-2">
                    <Badge tone="green">Cricket</Badge>
                    <Badge tone="blue">Football</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-display text-3xl font-extrabold">Pin the location</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-bold">
                  Street address
                  <input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="h-12 rounded-md border border-input bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>
                <label className="grid gap-1 text-sm font-bold">
                  Area
                  <input
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="h-12 rounded-md border border-input bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>
                <label className="grid gap-1 text-sm font-bold">
                  City
                  <input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="h-12 rounded-md border border-input bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>
                <label className="grid gap-1 text-sm font-bold">
                  Pincode
                  <input
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="h-12 rounded-md border border-input bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>
              </div>
              <div className="surface-grid mt-5 grid h-40 place-items-center rounded-md border border-border">
                <MapPin className="size-8 text-info" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-display text-3xl font-extrabold">Set your pricing</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <label className="grid gap-1 text-sm font-bold">
                  Hourly price (₹)
                  <input
                    value={formData.hourlyPrice}
                    onChange={(e) => setFormData({ ...formData, hourlyPrice: e.target.value })}
                    className="h-12 rounded-md border border-input bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>
                <label className="grid gap-1 text-sm font-bold">
                  Peak hour price (₹)
                  <input
                    value={formData.peakPrice}
                    onChange={(e) => setFormData({ ...formData, peakPrice: e.target.value })}
                    className="h-12 rounded-md border border-input bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>
                <label className="grid gap-1 text-sm font-bold">
                  Weekend price (₹)
                  <input
                    value={formData.weekendPrice}
                    onChange={(e) => setFormData({ ...formData, weekendPrice: e.target.value })}
                    className="h-12 rounded-md border border-input bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>
              </div>
              <p className="mt-5 rounded-md bg-reward-soft p-4 text-sm text-reward">
                Players always see transparent hourly prices with zero hidden charges.
              </p>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="font-display text-3xl font-extrabold">Select amenities</h2>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  "Floodlights",
                  "Parking",
                  "Changing room",
                  "Washroom",
                  "Drinking water",
                  "Seating",
                  "Equipment rental",
                  "Canteen",
                ].map((x, i) => (
                  <button
                    key={x}
                    className={`rounded-md border p-4 text-left text-sm font-bold ${
                      i < 5 ? "border-primary bg-secondary" : "border-border"
                    }`}
                  >
                    {i < 5 && <Check className="mb-2 size-4 text-success" />}
                    {x}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="font-display text-3xl font-extrabold">Upload real turf images</h2>
              <div className="mt-5 grid min-h-48 place-items-center rounded-md border-2 border-dashed border-border bg-muted/50 text-center">
                <div>
                  <ImagePlus className="mx-auto size-9 text-info" />
                  <p className="mt-3 font-bold">Drop images here or browse</p>
                  <p className="text-xs text-muted-foreground">Recent, authentic photos work best.</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-md bg-success-soft p-4">
                  <ShieldCheck className="size-5 text-success" />
                  <strong className="mt-2 block text-sm">Image appears authentic</strong>
                  <p className="text-xs text-muted-foreground">
                    Authenticity confidence: 96%. Verified ground photo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="font-display text-3xl font-extrabold">Operating hours</h2>
              <div className="mt-6 grid gap-2">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                  (d) => (
                    <div
                      key={d}
                      className="grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded-md border border-border p-3"
                    >
                      <strong className="text-sm">{d}</strong>
                      <span className="text-xs text-muted-foreground">06:00 AM – 11:00 PM</span>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="size-4 accent-primary"
                        aria-label={`Enable slots for ${d}`}
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {step === 7 && (
            <div>
              <h2 className="font-display text-3xl font-extrabold">Preview your listing</h2>
              <article className="card-shell mt-6 overflow-hidden">
                <img
                  src={initialTurfs[0]?.image ?? ""}
                  alt="Listing preview"
                  className="aspect-[16/7] w-full object-cover"
                />
                <div className="p-5">
                  <Badge tone="green">Ready for review</Badge>
                  <h3 className="mt-2 font-display text-3xl font-extrabold">{formData.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formData.area}, {formData.city} · ₹{formData.hourlyPrice}/hr
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">{formData.description}</p>
                </div>
              </article>
            </div>
          )}

          <div className="mt-8 flex justify-between border-t border-border pt-5">
            <Button
              variant="secondary"
              disabled={step === 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
            >
              Back
            </Button>
            <Button
              onClick={() => {
                if (step === 7) {
                  handleFinish();
                } else {
                  setStep((s) => Math.min(7, s + 1));
                }
              }}
            >
              {step === 7 ? "Submit for review" : "Continue"}
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </section>

        <aside className="card-shell p-5 space-y-4">
          <p className="text-sm font-bold">Listing readiness</p>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${Math.round((step / 7) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {Math.round((step / 7) * 100)}% complete
          </p>

          <div className="rounded-md bg-info-soft p-4">
            <Sparkles className="size-5 text-info" />
            <p className="mt-2 text-sm font-bold">Quality tip</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Listings with accurate addresses, clear photos, and active slots receive 4x more customer bookings.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
