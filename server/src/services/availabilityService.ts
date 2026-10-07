import { Slot, ISlot } from '../models/Slot';

export interface SlotInfo {
  id: string;
  turfId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'held' | 'unavailable' | 'maintenance';
  bookingId?: string;
  heldUntil?: Date | null;
  heldBy?: string | null;
}

const standardHours = [
  { start: '06:00 AM', end: '07:00 AM' },
  { start: '07:00 AM', end: '08:00 AM' },
  { start: '08:00 AM', end: '09:00 AM' },
  { start: '09:00 AM', end: '10:00 AM' },
  { start: '10:00 AM', end: '11:00 AM' },
  { start: '04:00 PM', end: '05:00 PM' },
  { start: '05:00 PM', end: '06:00 PM' },
  { start: '06:00 PM', end: '07:00 PM' },
  { start: '07:00 PM', end: '08:00 PM' },
  { start: '08:00 PM', end: '09:00 PM' },
  { start: '09:00 PM', end: '10:00 PM' },
  { start: '10:00 PM', end: '11:00 PM' },
];

export const getSlots = async (turfId: string, date: string): Promise<SlotInfo[]> => {
  const now = new Date();

  // 1. Release any expired holds for this turf & date
  await Slot.updateMany(
    {
      turfId,
      date,
      status: 'held',
      heldUntil: { $lt: now },
    },
    {
      $set: { status: 'available', heldUntil: null, heldBy: null },
    }
  );

  // 2. Fetch slots from MongoDB
  let slots = await Slot.find({ turfId, date }).sort({ startTime: 1 }).lean();

  // 3. If no slots exist yet for this date, seed them dynamically
  if (slots.length === 0) {
    const slotsToCreate = standardHours.map((h) => ({
      turfId,
      date,
      startTime: h.start,
      endTime: h.end,
      status: 'available',
    }));

    try {
      await Slot.insertMany(slotsToCreate, { ordered: false });
    } catch (e) {
      // Ignore race conditions on duplicate keys
    }

    slots = await Slot.find({ turfId, date }).sort({ startTime: 1 }).lean();
  }

  return slots.map((s: any) => ({
    id: s._id.toString(),
    turfId: s.turfId,
    date: s.date,
    startTime: s.startTime,
    endTime: s.endTime,
    status: s.status,
    bookingId: s.bookingId,
    heldUntil: s.heldUntil,
    heldBy: s.heldBy,
  }));
};

export const holdSlot = async (
  turfId: string,
  date: string,
  startTime: string,
  userId: string,
  holdMinutes: number = 10
) => {
  const now = new Date();
  const heldUntil = new Date(now.getTime() + holdMinutes * 60 * 1000);

  // Ensure slot exists in DB first
  let existing = await Slot.findOne({ turfId, date, startTime });
  if (!existing) {
    const matchedHour = standardHours.find((h) => h.start === startTime);
    const endTime = matchedHour ? matchedHour.end : startTime;
    try {
      await Slot.create({
        turfId,
        date,
        startTime,
        endTime,
        status: 'available',
      });
    } catch (e) {
      // Ignore if concurrent creation
    }
  }

  // Atomic hold operation: only succeed if available OR expired hold
  const slot = await Slot.findOneAndUpdate(
    {
      turfId,
      date,
      startTime,
      $or: [
        { status: 'available' },
        { status: 'held', heldUntil: { $lt: now } },
        { status: 'held', heldBy: userId }, // same user refreshing hold
      ],
    },
    {
      $set: {
        status: 'held',
        heldUntil,
        heldBy: userId,
      },
    },
    { new: true }
  );

  if (!slot) {
    const current = await Slot.findOne({ turfId, date, startTime });
    if (current?.status === 'booked') {
      throw new Error('This slot is already booked.');
    }
    throw new Error('This slot is currently held by another player. Please select another slot.');
  }

  return {
    id: slot._id.toString(),
    turfId: slot.turfId,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    status: slot.status,
    heldUntil: slot.heldUntil,
    heldBy: slot.heldBy,
  };
};

export const releaseHold = async (turfId: string, date: string, startTime: string, userId?: string) => {
  const query: any = { turfId, date, startTime, status: 'held' };
  if (userId && userId !== 'admin-1') {
    query.heldBy = userId;
  }

  const slot = await Slot.findOneAndUpdate(
    query,
    {
      $set: {
        status: 'available',
        heldUntil: null,
        heldBy: null,
      },
    },
    { new: true }
  );

  return slot;
};

export const blockSlot = async (turfId: string, date: string, startTime: string) => {
  const slot = await Slot.findOneAndUpdate(
    { turfId, date, startTime },
    { $set: { status: 'unavailable', heldUntil: null, heldBy: null } },
    { upsert: true, new: true }
  );
  return slot;
};

export const unblockSlot = async (turfId: string, date: string, startTime: string) => {
  const slot = await Slot.findOneAndUpdate(
    { turfId, date, startTime },
    { $set: { status: 'available', heldUntil: null, heldBy: null } },
    { new: true }
  );
  return slot;
};

export const setMaintenance = async (turfId: string, date: string, startTime: string) => {
  const slot = await Slot.findOneAndUpdate(
    { turfId, date, startTime },
    { $set: { status: 'maintenance', heldUntil: null, heldBy: null } },
    { upsert: true, new: true }
  );
  return slot;
};

export const availabilityService = {
  getSlots,
  holdSlot,
  releaseHold,
  blockSlot,
  unblockSlot,
  setMaintenance,
};
