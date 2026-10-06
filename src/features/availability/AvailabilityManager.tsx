import React, { useState, useMemo, useEffect } from 'react';
import { 
  CalendarDays, 
  Layers, 
  CheckCircle2, 
  Ban, 
  Wrench, 
  Unlock, 
  Check, 
  Clock, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Timer
} from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { useAvailabilityStore } from '@/store/useAvailabilityStore';
import { useOwnerStore } from '@/store/useOwnerStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { SlotStatus, TurfSlot } from '@/types';

interface AvailabilityManagerProps {
  initialTurfId?: string;
}

export function AvailabilityManager({ initialTurfId }: AvailabilityManagerProps) {
  const user = useAuthStore((s) => s.user);
  const turfs = useOwnerStore((s) => s.turfs);
  const myTurfs = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return turfs;
    return turfs.filter((t) => t.ownerId === user.id);
  }, [user, turfs]);

  const [selectedTurfId, setSelectedTurfId] = useState(
    initialTurfId ?? myTurfs[0]?.id ?? 'champions-arena'
  );

  // Automatically keep selectedTurfId synced to the owner's actual venues upon role/venue load
  useEffect(() => {
    if (myTurfs.length > 0 && !myTurfs.some((t) => t.id === selectedTurfId)) {
      setSelectedTurfId(myTurfs[0]!.id);
    }
  }, [myTurfs, selectedTurfId]);

  // Rolling 7 days for quick date tabs
  const dates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return {
        iso: d.toISOString().split('T')[0]!,
        label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        weekday: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      };
    });
  }, []);

  const [selectedDate, setSelectedDate] = useState(dates[0]!.iso);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    action: 'block' | 'maintenance' | 'unblock' | 'clear_maintenance';
    startTimes: string[];
  } | null>(null);

  const getSlots = useAvailabilityStore((s) => s.getSlots);
  const updateSlotStatus = useAvailabilityStore((s) => s.updateSlotStatus);
  const blockSlot = useAvailabilityStore((s) => s.blockSlot);
  const unblockSlot = useAvailabilityStore((s) => s.unblockSlot);
  const setMaintenance = useAvailabilityStore((s) => s.setMaintenance);
  const clearMaintenance = useAvailabilityStore((s) => s.clearMaintenance);
  const bulkBlockSlots = useAvailabilityStore((s) => s.bulkBlockSlots);
  const bulkSetMaintenance = useAvailabilityStore((s) => s.bulkSetMaintenance);
  const bulkClearMaintenance = useAvailabilityStore((s) => s.bulkClearMaintenance);
  const holdSlot = useAvailabilityStore((s) => s.holdSlot);
  const releaseHold = useAvailabilityStore((s) => s.releaseHold);
  const lastUpdated = useAvailabilityStore((s) => s.lastUpdated);

  const currentSlots = useMemo(
    () => getSlots(selectedTurfId, selectedDate),
    [getSlots, selectedTurfId, selectedDate, lastUpdated]
  );

  const showNotification = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleSelectSlot = (startTime: string) => {
    setSelectedSlots((prev) =>
      prev.includes(startTime) ? prev.filter((t) => t !== startTime) : [...prev, startTime]
    );
  };

  const handleSelectAllAvailable = () => {
    const avail = currentSlots.filter((s) => s.status === 'available').map((s) => s.startTime);
    setSelectedSlots(avail);
  };

  const handleClearSelection = () => {
    setSelectedSlots([]);
  };

  const executeBulkAction = () => {
    if (!confirmModal) return;
    const { action, startTimes } = confirmModal;

    if (action === 'block') {
      bulkBlockSlots(selectedTurfId, selectedDate, startTimes);
      showNotification(`${startTimes.length} slots have been BLOCKED.`);
    } else if (action === 'maintenance') {
      bulkSetMaintenance(selectedTurfId, selectedDate, startTimes);
      showNotification(`${startTimes.length} slots marked for MAINTENANCE.`);
    } else if (action === 'clear_maintenance') {
      bulkClearMaintenance(selectedTurfId, selectedDate, startTimes);
      showNotification(`Maintenance cleared for ${startTimes.length} slots.`);
    }

    setSelectedSlots([]);
    setConfirmModal(null);
  };

  return (
    <div className="card-shell p-6 md:p-8">
      {/* Header with Venue Selector & Last Updated Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="blue">
              <Layers className="size-3" />
              SLOT AVAILABILITY ENGINE
            </Badge>
            <span className="text-[11px] text-muted-foreground font-mono">
              Last synced: {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          </div>
          <h2 className="mt-2 font-display text-3xl font-black">VENUE AVAILABILITY CONTROLS</h2>
          <p className="text-xs text-muted-foreground">
            Changes update the real-time reservation matrix instantly across all customer devices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {myTurfs.length > 0 && (
            <select
              value={selectedTurfId}
              onChange={(e) => setSelectedTurfId(e.target.value)}
              aria-label="Select venue"
              className="h-10 rounded-md border border-border bg-card px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary"
            >
              {myTurfs.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.city})
                </option>
              ))}
            </select>
          )}

          <div className="flex rounded-md border border-border bg-secondary/50 p-1">
            <button
              onClick={() => setViewMode('day')}
              className={`rounded px-3 py-1 text-xs font-bold transition ${
                viewMode === 'day' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Day Grid
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`rounded px-3 py-1 text-xs font-bold transition ${
                viewMode === 'week' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Week View
            </button>
          </div>
        </div>
      </div>

      {notice && (
        <div className="mt-4 flex items-center gap-2 rounded-md bg-secondary border border-primary/40 p-3 text-xs font-bold text-foreground animate-in fade-in">
          <CheckCircle2 className="size-4 text-primary" />
          {notice}
        </div>
      )}

      {/* Date Bar */}
      <div className="mt-6 flex items-center justify-between gap-4 overflow-x-auto pb-2">
        <div className="flex gap-2">
          {dates.map((d) => (
            <button
              key={d.iso}
              onClick={() => setSelectedDate(d.iso)}
              className={`flex min-w-20 flex-col items-center justify-center rounded-lg border p-2.5 transition text-xs font-bold ${
                selectedDate === d.iso
                  ? 'border-primary bg-secondary text-foreground shadow-sm'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40'
              }`}
            >
              <span className="text-[10px] text-muted-foreground">{d.weekday}</span>
              <span className="text-sm font-extrabold">{d.label}</span>
            </button>
          ))}
        </div>

        {/* Bulk Action Controls */}
        {selectedSlots.length > 0 && (
          <div className="flex items-center gap-2 shrink-0 bg-muted/60 p-1.5 rounded-lg border border-border">
            <span className="text-xs font-bold px-2">{selectedSlots.length} selected</span>
            <Button
              size="sm"
              variant="secondary"
              className="text-xs"
              onClick={() => setConfirmModal({ action: 'block', startTimes: selectedSlots })}
            >
              <Ban className="size-3 mr-1" /> Bulk Block
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="text-xs"
              onClick={() => setConfirmModal({ action: 'maintenance', startTimes: selectedSlots })}
            >
              <Wrench className="size-3 mr-1" /> Maintenance
            </Button>
            <button
              onClick={handleClearSelection}
              className="text-xs text-muted-foreground hover:text-foreground px-2"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Status Legend */}
      <div className="mt-5 flex flex-wrap items-center gap-4 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
        <span className="font-bold text-foreground">Status Legend:</span>
        <span className="flex items-center gap-1.5 font-bold text-emerald-500">
          <span className="size-2.5 rounded-full bg-emerald-500" /> Available
        </span>
        <span className="flex items-center gap-1.5 font-bold text-muted-foreground">
          <span className="size-2.5 rounded-full bg-muted-foreground" /> Booked / Paid
        </span>
        <span className="flex items-center gap-1.5 font-bold text-amber-500">
          <span className="size-2.5 rounded-full bg-amber-500" /> Held (10-Min Cart)
        </span>
        <span className="flex items-center gap-1.5 font-bold text-blue-500">
          <span className="size-2.5 rounded-full bg-blue-500" /> Maintenance
        </span>
        <span className="flex items-center gap-1.5 font-bold text-rose-500">
          <span className="size-2.5 rounded-full bg-rose-500" /> Blocked / Unavailable
        </span>
      </div>

      {/* Main Day Grid / Table */}
      {viewMode === 'day' ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-muted text-xs text-muted-foreground uppercase font-mono">
              <tr>
                <th className="p-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedSlots.length > 0 &&
                      selectedSlots.length ===
                        currentSlots.filter((s) => s.status === 'available').length
                    }
                    onChange={(e) => {
                      if (e.target.checked) handleSelectAllAvailable();
                      else handleClearSelection();
                    }}
                    aria-label="Select all available slots"
                  />
                </th>
                <th className="p-3.5">Time Window</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Booking / Hold Info</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {currentSlots.map((slot) => {
                const isAvail = slot.status === 'available';
                const isBooked = slot.status === 'booked';
                const isHeld = slot.status === 'held';
                const isMaint = slot.status === 'maintenance';
                const isUnavail = slot.status === 'unavailable';

                return (
                  <tr key={slot.id} className="hover:bg-muted/30 transition">
                    <td className="p-3.5">
                      <input
                        type="checkbox"
                        checked={selectedSlots.includes(slot.startTime)}
                        onChange={() => handleSelectSlot(slot.startTime)}
                        aria-label={`Select slot ${slot.startTime}`}
                      />
                    </td>
                    <td className="p-3.5 font-mono font-bold text-foreground">
                      {slot.startTime} – {slot.endTime}
                    </td>
                    <td className="p-3.5">
                      {slot.isPeakHour ? (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-extrabold text-amber-500">
                          <Sparkles className="size-3" /> Peak Hour
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground font-semibold">Standard</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <Badge
                        tone={
                          isAvail
                            ? 'green'
                            : isBooked
                              ? 'neutral'
                              : isMaint
                                ? 'blue'
                                : 'gold'
                        }
                      >
                        {slot.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-xs text-muted-foreground">
                      {slot.bookingId ? (
                        <span className="font-mono text-foreground font-bold">#{slot.bookingId}</span>
                      ) : isHeld ? (
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <Timer className="size-3" /> Hold active (10m)
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {/* Quick Status Dropdown Selector */}
                        <select
                          value={slot.status}
                          onChange={(e) => {
                            const newSt = e.target.value as any;
                            updateSlotStatus(selectedTurfId, selectedDate, slot.startTime, newSt);
                            showNotification(`Slot ${slot.startTime} updated to ${newSt.toUpperCase()}`);
                          }}
                          aria-label={`Change status for slot ${slot.startTime}`}
                          className="h-8 rounded-md border border-border bg-card px-2 py-0.5 text-xs font-bold text-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                        >
                          <option value="available">🟢 Available</option>
                          <option value="unavailable">⚫ Offline / Blocked</option>
                          <option value="maintenance">🔵 Maintenance</option>
                          <option value="held">🟡 Temporary Hold</option>
                          <option value="booked">🔒 Match Reserved</option>
                        </select>

                        {/* Quick action buttons for convenience */}
                        {isAvail && (
                          <>
                            <button
                              onClick={() => {
                                blockSlot(selectedTurfId, selectedDate, slot.startTime);
                                showNotification(`Slot ${slot.startTime} has been BLOCKED.`);
                              }}
                              className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs font-bold text-foreground hover:bg-muted/80 transition cursor-pointer"
                              title="Block slot"
                            >
                              <Ban className="size-3" /> Block
                            </button>
                            <button
                              onClick={() => {
                                setMaintenance(selectedTurfId, selectedDate, slot.startTime);
                                showNotification(`Slot ${slot.startTime} set to MAINTENANCE.`);
                              }}
                              className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-1 text-xs font-bold text-blue-500 hover:bg-blue-500/20 transition cursor-pointer"
                              title="Schedule pitch repairs"
                            >
                              <Wrench className="size-3" /> Maint.
                            </button>
                          </>
                        )}

                        {isUnavail && (
                          <>
                            <button
                              onClick={() => {
                                unblockSlot(selectedTurfId, selectedDate, slot.startTime);
                                showNotification(`Slot ${slot.startTime} is now AVAILABLE.`);
                              }}
                              className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-500 hover:bg-emerald-500/20 transition cursor-pointer"
                            >
                              <Unlock className="size-3" /> Unblock
                            </button>
                            <button
                              onClick={() => {
                                setMaintenance(selectedTurfId, selectedDate, slot.startTime);
                                showNotification(`Slot ${slot.startTime} switched to MAINTENANCE.`);
                              }}
                              className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-1 text-xs font-bold text-blue-500 hover:bg-blue-500/20 transition cursor-pointer"
                            >
                              <Wrench className="size-3" /> Maint.
                            </button>
                          </>
                        )}

                        {isMaint && (
                          <>
                            <button
                              onClick={() => {
                                clearMaintenance(selectedTurfId, selectedDate, slot.startTime);
                                showNotification(`Maintenance cleared for ${slot.startTime}. Slot is AVAILABLE.`);
                              }}
                              className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-500 hover:bg-emerald-500/20 transition cursor-pointer"
                            >
                              <Check className="size-3" /> Clear Maint
                            </button>
                            <button
                              onClick={() => {
                                blockSlot(selectedTurfId, selectedDate, slot.startTime);
                                showNotification(`Slot ${slot.startTime} switched to BLOCKED.`);
                              }}
                              className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs font-bold text-foreground hover:bg-muted/80 transition cursor-pointer"
                            >
                              <Ban className="size-3" /> Block
                            </button>
                          </>
                        )}

                        {isHeld && (
                          <button
                            onClick={() => {
                              releaseHold(selectedTurfId, selectedDate, slot.startTime);
                              showNotification(`Hold released for ${slot.startTime}. Slot is AVAILABLE.`);
                            }}
                            className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs font-bold text-foreground hover:bg-muted/80 transition cursor-pointer"
                          >
                            <RotateCcw className="size-3" /> Release Hold
                          </button>
                        )}

                        {isBooked && (
                          <button
                            onClick={() => {
                              updateSlotStatus(selectedTurfId, selectedDate, slot.startTime, 'available');
                              showNotification(`Booking cleared. Slot ${slot.startTime} is now AVAILABLE.`);
                            }}
                            className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-1 text-[11px] font-bold text-rose-500 hover:bg-rose-500/20 transition cursor-pointer"
                            title="Reset match booking to available"
                          >
                            <RotateCcw className="size-3" /> Reset Slot
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Week View Grid */
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {dates.map((d) => {
            const daySlots = getSlots(selectedTurfId, d.iso);
            const availCount = daySlots.filter((s) => s.status === 'available').length;
            const bookedCount = daySlots.filter((s) => s.status === 'booked').length;
            const isSelected = selectedDate === d.iso;

            return (
              <div
                key={d.iso}
                onClick={() => {
                  setSelectedDate(d.iso);
                  setViewMode('day');
                }}
                className={`card-shell cursor-pointer p-4 transition hover:border-primary ${
                  isSelected ? 'border-primary ring-1 ring-primary' : ''
                }`}
              >
                <p className="text-[11px] font-bold text-muted-foreground">{d.weekday}</p>
                <h4 className="font-display text-lg font-black">{d.label}</h4>
                <div className="mt-4 space-y-1.5 text-xs font-bold">
                  <div className="flex justify-between text-emerald-500">
                    <span>Avail:</span>
                    <span>{availCount}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Booked:</span>
                    <span>{bookedCount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog Modal for Bulk Actions */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="card-shell w-full max-w-md p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="size-6 text-amber-500" />
              <h3 className="font-display text-xl font-black uppercase">
                Confirm {confirmModal.action.replace('_', ' ')}
              </h3>
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to apply <strong>{confirmModal.action}</strong> to{' '}
              {confirmModal.startTimes.length} selected slots on <strong>{selectedDate}</strong>?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmModal(null)}>
                Cancel
              </Button>
              <Button onClick={executeBulkAction}>Confirm</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
