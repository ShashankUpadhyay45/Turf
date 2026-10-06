export interface SlotInfo {
  id: string;
  turfId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'held' | 'unavailable' | 'maintenance';
  bookingId?: string;
  heldUntil?: Date | null;
}

const baseHours = [
  '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM',
  '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM'
];

function getEndTime(start: string): string {
  const match = start.match(/(\d{2}):(\d{2})\s*(AM|PM)/);
  if (!match) return start;
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

// In-memory slot state storage
const dynamicSlotOverrides = new Map<string, string>();

export const getSlots = async (turfId: string, date: string): Promise<SlotInfo[]> => {
  // Deterministic seed based on turf + date
  let hash = 0;
  const keyBase = `${turfId}-${date}`;
  for (let i = 0; i < keyBase.length; i++) {
    hash = ((hash << 5) - hash) + keyBase.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  return baseHours.map((startTime, idx) => {
    const slotKey = `${turfId}-${date}-${startTime}`;
    let status: SlotInfo['status'] = 'available';

    if (dynamicSlotOverrides.has(slotKey)) {
      status = dynamicSlotOverrides.get(slotKey) as any;
    } else {
      const slotSeed = (absHash + idx * 7) % 100;
      if (slotSeed < 20) {
        status = 'booked';
      } else if (slotSeed < 26) {
        status = 'maintenance';
      }
    }

    return {
      id: `${turfId}-${date}-${startTime.replace(/[\s:]/g, '')}`,
      turfId,
      date,
      startTime,
      endTime: getEndTime(startTime),
      status,
      bookingId: status === 'booked' ? `TB-${turfId}-${idx}` : undefined,
    };
  });
};

export const holdSlot = async (turfId: string, date: string, startTime: string, userId: string) => {
  const slotKey = `${turfId}-${date}-${startTime}`;
  dynamicSlotOverrides.set(slotKey, 'held');
  return {
    turfId,
    date,
    startTime,
    status: 'held' as const,
    heldUntil: new Date(Date.now() + 10 * 60000),
  };
};

export const blockSlot = async (turfId: string, date: string, startTime: string, ownerId: string) => {
  const slotKey = `${turfId}-${date}-${startTime}`;
  dynamicSlotOverrides.set(slotKey, 'unavailable');
  return { turfId, date, startTime, status: 'unavailable' as const };
};

export const unblockSlot = async (turfId: string, date: string, startTime: string, ownerId: string) => {
  const slotKey = `${turfId}-${date}-${startTime}`;
  dynamicSlotOverrides.set(slotKey, 'available');
  return { turfId, date, startTime, status: 'available' as const };
};

export const setMaintenance = async (turfId: string, date: string, startTime: string, ownerId: string) => {
  const slotKey = `${turfId}-${date}-${startTime}`;
  dynamicSlotOverrides.set(slotKey, 'maintenance');
  return { turfId, date, startTime, status: 'maintenance' as const };
};

export const clearMaintenance = async (turfId: string, date: string, startTime: string, ownerId: string) => {
  const slotKey = `${turfId}-${date}-${startTime}`;
  dynamicSlotOverrides.set(slotKey, 'available');
  return { turfId, date, startTime, status: 'available' as const };
};

export const availabilityService = {
  getSlots,
  holdSlot,
  blockSlot,
  unblockSlot,
  setMaintenance,
  clearMaintenance,
};
