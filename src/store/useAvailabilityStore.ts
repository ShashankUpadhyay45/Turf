import { create } from 'zustand';
import { slots } from '@/data/turfs';
import type { TurfSlot, SlotStatus } from '@/types';

interface AvailabilityState {
  slotsByTurfDate: Record<string, TurfSlot[]>; // key: `${turfId}-${date}`
  lastUpdated: string;
  
  getSlots: (turfId: string, date: string) => TurfSlot[];
  initializeSlots: (turfId: string, date: string) => void;
  bookSlot: (turfId: string, date: string, startTime: string, bookingId: string) => boolean;
  blockSlot: (turfId: string, date: string, startTime: string) => void;
  unblockSlot: (turfId: string, date: string, startTime: string) => void;
  setMaintenance: (turfId: string, date: string, startTime: string) => void;
  clearMaintenance: (turfId: string, date: string, startTime: string) => void;
  updateSlotStatus: (turfId: string, date: string, startTime: string, newStatus: SlotStatus) => void;
  holdSlot: (turfId: string, date: string, startTime: string, userId: string) => boolean;
  releaseHold: (turfId: string, date: string, startTime: string) => void;
  bulkBlockSlots: (turfId: string, date: string, startTimes: string[]) => void;
  bulkSetMaintenance: (turfId: string, date: string, startTimes: string[]) => void;
  bulkClearMaintenance: (turfId: string, date: string, startTimes: string[]) => void;
  isSlotAvailable: (turfId: string, date: string, startTime: string) => boolean;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getEndTime(startTime: string): string {
  const match = startTime.match(/(\d{2}):(\d{2})\s*(AM|PM)/);
  if (!match) return startTime;
  let hours = parseInt(match[1]!, 10);
  const minutes = match[2];
  const period = match[3]!;
  
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  hours = (hours + 1) % 24;
  const newPeriod = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${String(displayHours).padStart(2, '0')}:${minutes} ${newPeriod}`;
}

function generateSlotsForDate(turfId: string, date: string): TurfSlot[] {
  const seed = hashCode(`${turfId}-${date}`);
  
  return slots.map((startTime, index) => {
    const slotSeed = (seed + index * 7) % 100;
    let status: SlotStatus = 'available';
    
    // Deterministic pseudo-random distribution
    if (slotSeed < 20) {
      status = 'booked';
    } else if (slotSeed < 26) {
      status = 'maintenance';
    } else if (slotSeed < 30) {
      status = 'held';
    }
    
    const isPeak = startTime.includes('07:00 PM') || startTime.includes('08:00 PM') || startTime.includes('09:00 PM');

    return {
      id: `${turfId}-${date}-${startTime.replace(/[\s:]/g, '')}`,
      turfId,
      date,
      startTime,
      endTime: getEndTime(startTime),
      status,
      isPeakHour: isPeak,
      bookingId: status === 'booked' ? `TB-2026-${Math.floor(100000 + (slotSeed * 999))}` : undefined,
      heldUntil: status === 'held' ? new Date(Date.now() + 10 * 60 * 1000).toISOString() : undefined,
    };
  });
}

export const useAvailabilityStore = create<AvailabilityState>()((set, get) => ({
  slotsByTurfDate: {},
  lastUpdated: new Date().toISOString(),

  getSlots: (turfId: string, date: string) => {
    const key = `${turfId}-${date}`;
    const existing = get().slotsByTurfDate[key];
    if (existing) return existing;
    get().initializeSlots(turfId, date);
    return get().slotsByTurfDate[key] ?? [];
  },

  initializeSlots: (turfId: string, date: string) => {
    const key = `${turfId}-${date}`;
    if (get().slotsByTurfDate[key]) return;
    const newSlots = generateSlotsForDate(turfId, date);
    set((state) => ({
      slotsByTurfDate: {
        ...state.slotsByTurfDate,
        [key]: newSlots,
      },
      lastUpdated: new Date().toISOString(),
    }));
  },

  bookSlot: (turfId: string, date: string, startTime: string, bookingId: string) => {
    const key = `${turfId}-${date}`;
    const currentSlots = get().slotsByTurfDate[key];
    if (!currentSlots) return false;
    
    const slotIndex = currentSlots.findIndex((s) => s.startTime === startTime);
    if (slotIndex === -1) return false;
    
    const slot = currentSlots[slotIndex]!;
    if (slot.status !== 'available' && slot.status !== 'held') return false;
    
    const updatedSlots = [...currentSlots];
    updatedSlots[slotIndex] = {
      ...slot,
      status: 'booked',
      bookingId,
    };
    
    set((state) => ({
      slotsByTurfDate: {
        ...state.slotsByTurfDate,
        [key]: updatedSlots,
      },
      lastUpdated: new Date().toISOString(),
    }));
    return true;
  },

  updateSlotStatus: (turfId: string, date: string, startTime: string, newStatus: SlotStatus) => {
    const key = `${turfId}-${date}`;
    get().initializeSlots(turfId, date);
    const currentSlots = get().slotsByTurfDate[key];
    if (!currentSlots) return;

    set((state) => ({
      slotsByTurfDate: {
        ...state.slotsByTurfDate,
        [key]: currentSlots.map((s) => {
          if (s.startTime !== startTime) return s;
          return {
            ...s,
            status: newStatus,
            bookingId: newStatus === 'available' ? undefined : s.bookingId,
            heldUntil: newStatus === 'held' ? new Date(Date.now() + 10 * 60 * 1000).toISOString() : undefined,
          };
        }),
      },
      lastUpdated: new Date().toISOString(),
    }));
  },

  blockSlot: (turfId: string, date: string, startTime: string) => {
    get().updateSlotStatus(turfId, date, startTime, 'unavailable');
  },

  unblockSlot: (turfId: string, date: string, startTime: string) => {
    get().updateSlotStatus(turfId, date, startTime, 'available');
  },

  setMaintenance: (turfId: string, date: string, startTime: string) => {
    get().updateSlotStatus(turfId, date, startTime, 'maintenance');
  },

  clearMaintenance: (turfId: string, date: string, startTime: string) => {
    get().updateSlotStatus(turfId, date, startTime, 'available');
  },

  holdSlot: (turfId: string, date: string, startTime: string, userId: string) => {
    const key = `${turfId}-${date}`;
    get().initializeSlots(turfId, date);
    const currentSlots = get().slotsByTurfDate[key];
    if (!currentSlots) return false;

    const slotIndex = currentSlots.findIndex((s) => s.startTime === startTime);
    if (slotIndex === -1 || currentSlots[slotIndex]!.status !== 'available') return false;

    const updated = [...currentSlots];
    updated[slotIndex] = {
      ...updated[slotIndex]!,
      status: 'held',
      heldByUserId: userId,
      heldUntil: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    };

    set((state) => ({
      slotsByTurfDate: {
        ...state.slotsByTurfDate,
        [key]: updated,
      },
      lastUpdated: new Date().toISOString(),
    }));
    return true;
  },

  releaseHold: (turfId: string, date: string, startTime: string) => {
    const key = `${turfId}-${date}`;
    const currentSlots = get().slotsByTurfDate[key];
    if (!currentSlots) return;

    set((state) => ({
      slotsByTurfDate: {
        ...state.slotsByTurfDate,
        [key]: currentSlots.map((s) =>
          s.startTime === startTime && s.status === 'held'
            ? { ...s, status: 'available' as SlotStatus, heldUntil: undefined, heldByUserId: undefined }
            : s
        ),
      },
      lastUpdated: new Date().toISOString(),
    }));
  },

  bulkBlockSlots: (turfId: string, date: string, startTimes: string[]) => {
    const key = `${turfId}-${date}`;
    get().initializeSlots(turfId, date);
    const currentSlots = get().slotsByTurfDate[key];
    if (!currentSlots) return;

    set((state) => ({
      slotsByTurfDate: {
        ...state.slotsByTurfDate,
        [key]: currentSlots.map((s) =>
          startTimes.includes(s.startTime) && s.status === 'available'
            ? { ...s, status: 'unavailable' as SlotStatus }
            : s
        ),
      },
      lastUpdated: new Date().toISOString(),
    }));
  },

  bulkSetMaintenance: (turfId: string, date: string, startTimes: string[]) => {
    const key = `${turfId}-${date}`;
    get().initializeSlots(turfId, date);
    const currentSlots = get().slotsByTurfDate[key];
    if (!currentSlots) return;

    set((state) => ({
      slotsByTurfDate: {
        ...state.slotsByTurfDate,
        [key]: currentSlots.map((s) =>
          startTimes.includes(s.startTime) && (s.status === 'available' || s.status === 'unavailable')
            ? { ...s, status: 'maintenance' as SlotStatus }
            : s
        ),
      },
      lastUpdated: new Date().toISOString(),
    }));
  },

  bulkClearMaintenance: (turfId: string, date: string, startTimes: string[]) => {
    const key = `${turfId}-${date}`;
    const currentSlots = get().slotsByTurfDate[key];
    if (!currentSlots) return;

    set((state) => ({
      slotsByTurfDate: {
        ...state.slotsByTurfDate,
        [key]: currentSlots.map((s) =>
          startTimes.includes(s.startTime) && s.status === 'maintenance'
            ? { ...s, status: 'available' as SlotStatus }
            : s
        ),
      },
      lastUpdated: new Date().toISOString(),
    }));
  },

  isSlotAvailable: (turfId: string, date: string, startTime: string) => {
    const key = `${turfId}-${date}`;
    const currentSlots = get().slotsByTurfDate[key];
    if (!currentSlots) return false;
    const slot = currentSlots.find((s) => s.startTime === startTime);
    return slot?.status === 'available';
  },
}));
