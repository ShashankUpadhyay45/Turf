import { useAvailabilityStore } from '@/store/useAvailabilityStore';
import { useMemo } from 'react';

export function useAvailability(turfId: string, date: string) {
  const getSlots = useAvailabilityStore((s) => s.getSlots);
  const bookSlot = useAvailabilityStore((s) => s.bookSlot);
  const blockSlot = useAvailabilityStore((s) => s.blockSlot);
  const unblockSlot = useAvailabilityStore((s) => s.unblockSlot);
  const setMaintenance = useAvailabilityStore((s) => s.setMaintenance);
  const clearMaintenance = useAvailabilityStore((s) => s.clearMaintenance);
  const isSlotAvailable = useAvailabilityStore((s) => s.isSlotAvailable);

  const slots = useMemo(() => {
    if (!turfId || !date) return [];
    return getSlots(turfId, date);
  }, [turfId, date, getSlots]);

  const availableCount = useMemo(
    () => slots.filter((s) => s.status === 'available').length,
    [slots]
  );

  const bookedCount = useMemo(
    () => slots.filter((s) => s.status === 'booked').length,
    [slots]
  );

  return {
    slots,
    availableCount,
    bookedCount,
    bookSlot: (startTime: string, bookingId: string) =>
      bookSlot(turfId, date, startTime, bookingId),
    blockSlot: (startTime: string) => blockSlot(turfId, date, startTime),
    unblockSlot: (startTime: string) => unblockSlot(turfId, date, startTime),
    setMaintenance: (startTime: string) => setMaintenance(turfId, date, startTime),
    clearMaintenance: (startTime: string) => clearMaintenance(turfId, date, startTime),
    isSlotAvailable: (startTime: string) => isSlotAvailable(turfId, date, startTime),
  };
}
