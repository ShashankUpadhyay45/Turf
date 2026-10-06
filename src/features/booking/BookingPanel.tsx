import { useNavigate } from '@tanstack/react-router';
import { CalendarDays, Clock3, AlertCircle, Wrench, Lock, Timer, Check, Sparkles } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { Turf } from '@/types';
import { useAvailabilityStore } from '@/store/useAvailabilityStore';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui';

// Generate next 7 dates in YYYY-MM-DD format
function generateDates(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() + i);
    return {
      iso: day.toISOString().split('T')[0]!,
      label: day.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      dayName: day.toLocaleDateString('en-IN', { weekday: 'short' }),
      isToday: i === 0,
    };
  });
}

type SlotStatus = 'available' | 'booked' | 'held' | 'unavailable' | 'maintenance';

const statusConfig: Record<SlotStatus, { label: string; className: string; disabled: boolean; icon?: typeof AlertCircle }> = {
  available: {
    label: 'Open',
    className: 'border-border/80 bg-card text-foreground hover:border-primary active:scale-[0.98]',
    disabled: false,
  },
  booked: {
    label: 'Booked',
    className: 'border-border/40 bg-muted/40 text-muted-foreground/60 line-through cursor-not-allowed opacity-60',
    disabled: true,
    icon: Lock,
  },
  held: {
    label: 'Held',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-500 cursor-not-allowed opacity-80',
    disabled: true,
    icon: Timer,
  },
  unavailable: {
    label: 'Blocked',
    className: 'border-border/40 bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50',
    disabled: true,
    icon: AlertCircle,
  },
  maintenance: {
    label: 'Maint.',
    className: 'border-sky-500/30 bg-sky-500/10 text-sky-400 cursor-not-allowed opacity-80',
    disabled: true,
    icon: Wrench,
  },
};

export function BookingPanel({ turf, compact = false }: { turf: Turf; compact?: boolean }) {
  const navigate = useNavigate();
  const setBooking = useAppStore((s) => s.setBooking);
  const dates = useMemo(() => generateDates(7), []);
  const [selectedDate, setSelectedDate] = useState(dates[0]!);
  const [selectedSlot, setSelectedSlot] = useState('');

  const getSlots = useAvailabilityStore((s) => s.getSlots);
  const slots = useMemo(
    () => getSlots(turf.id, selectedDate.iso),
    [getSlots, turf.id, selectedDate.iso]
  );

  const availableCount = slots.filter((s) => s.status === 'available').length;
  const displaySlots = compact ? slots.slice(-3) : slots;

  return (
    <div className={compact ? 'w-full max-w-full min-w-0' : 'card-shell p-3.5 sm:p-6 space-y-4 sm:space-y-5 w-full max-w-full min-w-0 overflow-hidden'}>
      {/* Rate & Title */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 gap-2 min-w-0">
        <div className="min-w-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-primary block truncate">
            Instant Match Reservation
          </span>
          <h2 className="font-display text-lg sm:text-2xl font-black text-foreground truncate">
            Select Match Slot
          </h2>
        </div>
        <div className="text-right shrink-0">
          <span className="font-display text-xl sm:text-3xl font-black text-foreground">
            ₹{turf.pricePerHour}
          </span>
          <span className="text-[11px] sm:text-xs font-bold text-muted-foreground block">
            {turf.bookingUnit === 'per_person' ? 'per person' : 'per hour'}
          </span>
        </div>
      </div>

      {/* Date Selector Pill Carousel */}
      <div className="space-y-2 w-full min-w-0 overflow-hidden">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-1.5 text-foreground truncate">
            <CalendarDays className="size-4 text-primary shrink-0" />
            1. Select Match Date
          </span>
          <span className="text-muted-foreground text-[11px] shrink-0">
            {selectedDate.label} ({selectedDate.dayName})
          </span>
        </div>

        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none snap-x w-full min-w-0">
          {dates.map((d) => {
            const isSelected = selectedDate.iso === d.iso;
            return (
              <button
                type="button"
                key={d.iso}
                onClick={() => {
                  setSelectedDate(d);
                  setSelectedSlot('');
                }}
                className={`snap-start flex flex-col items-center justify-center min-w-[62px] sm:min-w-[80px] py-2 sm:py-2.5 px-1.5 sm:px-2 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground shadow-md scale-102 font-black'
                    : 'border-border/80 bg-card hover:bg-muted/50 text-foreground font-bold'
                }`}
              >
                <span className={`text-[9px] sm:text-[10px] uppercase tracking-wider ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {d.isToday ? 'Today' : d.dayName}
                </span>
                <span className="text-[11px] sm:text-sm font-black mt-0.5 whitespace-nowrap">
                  {d.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots Grid */}
      <div className="space-y-2 w-full min-w-0 overflow-hidden">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-1.5 text-foreground truncate">
            <Clock3 className="size-4 text-primary shrink-0" />
            2. Choose Kickoff Time
          </span>
          <span className="text-emerald-500 font-extrabold text-[11px] shrink-0">
            {availableCount} slots available
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 max-h-[260px] overflow-y-auto pr-1 w-full min-w-0">
          {displaySlots.map((slot) => {
            const config = statusConfig[slot.status];
            const isSelected = selectedSlot === slot.startTime;
            const StatusIcon = config.icon;

            return (
              <button
                type="button"
                key={slot.id}
                disabled={config.disabled}
                onClick={() => setSelectedSlot(slot.startTime)}
                className={`flex items-center justify-between min-w-0 rounded-xl border px-2 sm:px-3 py-2 sm:py-2.5 text-xs font-bold transition-all duration-150 cursor-pointer overflow-hidden ${
                  isSelected && !config.disabled
                    ? 'border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/40'
                    : config.className
                }`}
              >
                <span className="truncate text-[11px] sm:text-xs min-w-0">{slot.startTime}</span>
                <span className="flex items-center gap-0.5 sm:gap-1 shrink-0 text-[9px] sm:text-[10px] pl-1">
                  {StatusIcon ? (
                    <StatusIcon className="size-3 shrink-0" />
                  ) : isSelected ? (
                    <Check className="size-3 shrink-0" />
                  ) : null}
                  <span className="truncate">{config.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 text-[10px] text-muted-foreground border-t border-border/50">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-emerald-500" /> Open
          </span>
          <span className="flex items-center gap-1">
            <Lock className="size-2.5 text-muted-foreground" /> Booked
          </span>
          <span className="flex items-center gap-1">
            <Timer className="size-2.5 text-amber-500" /> In Hold
          </span>
          <span className="flex items-center gap-1">
            <Wrench className="size-2.5 text-sky-400" /> Maintenance
          </span>
        </div>
      </div>

      {/* Dynamic Selection Summary Banner */}
      {selectedSlot && (
        <div className="rounded-xl bg-primary/10 border border-primary/30 p-2.5 sm:p-3 text-xs flex items-center justify-between gap-2 min-w-0 overflow-hidden animate-in fade-in">
          <div className="min-w-0">
            <span className="font-bold text-foreground block truncate">
              {selectedDate.label} ({selectedDate.dayName}) at {selectedSlot}
            </span>
            <span className="text-[10px] text-muted-foreground truncate block">
              Estimated Total: ₹{turf.pricePerHour} (Includes lights & nets)
            </span>
          </div>
          <span className="text-primary font-black text-sm shrink-0">₹{turf.pricePerHour}</span>
        </div>
      )}

      {/* CTA Button */}
      <Button
        tone="primary"
        className="w-full h-12 rounded-xl text-sm font-black shadow-action transition active:scale-[0.98]"
        disabled={!selectedDate || !selectedSlot}
        onClick={() => {
          setBooking(selectedDate.iso, selectedSlot);
          navigate({ to: '/booking/$turfId', params: { turfId: turf.id } });
        }}
      >
        {selectedSlot
          ? `Proceed to Checkout · ₹${turf.pricePerHour}`
          : 'Select a Slot to Book'}
      </Button>
    </div>
  );
}
