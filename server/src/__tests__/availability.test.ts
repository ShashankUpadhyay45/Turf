import { describe, it, expect } from 'vitest';
import { availabilityService } from '../services/availabilityService';

describe('Exact Slot Availability Engine', () => {
  it('returns valid discrete slot statuses', async () => {
    const slots = await availabilityService.getSlots('champions-arena', '2026-09-30');
    expect(slots.length).toBeGreaterThan(0);

    const validStatuses = ['available', 'booked', 'held', 'unavailable', 'maintenance'];
    slots.forEach((s) => {
      expect(validStatuses).toContain(s.status);
      expect(s.startTime).toBeDefined();
      expect(s.endTime).toBeDefined();
    });
  });

  it('generates consistent deterministic slot availability for the same turf and date', async () => {
    const slots1 = await availabilityService.getSlots('champions-arena', '2026-10-05');
    const slots2 = await availabilityService.getSlots('champions-arena', '2026-10-05');

    expect(slots1.map((s) => s.status)).toEqual(slots2.map((s) => s.status));
  });

  it('allows owner to block and unblock slots', async () => {
    const turfId = 'champions-arena';
    const date = '2026-10-12';
    const startTime = '06:00 AM';

    const blocked = await availabilityService.blockSlot(turfId, date, startTime, 'owner-1');
    expect(blocked.status).toBe('unavailable');

    const unblocked = await availabilityService.unblockSlot(turfId, date, startTime, 'owner-1');
    expect(unblocked.status).toBe('available');
  });
});
