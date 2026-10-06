import { useBookingStore } from '@/store/useBookingStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useMemo } from 'react';

export function useBooking() {
  const user = useAuthStore((s) => s.user);
  const addBooking = useBookingStore((s) => s.addBooking);
  const cancelBooking = useBookingStore((s) => s.cancelBooking);
  const getUserBookings = useBookingStore((s) => s.getUserBookings);
  const getBookingsByTurf = useBookingStore((s) => s.getBookingsByTurf);
  const getBookingById = useBookingStore((s) => s.getBookingById);
  const getAllBookings = useBookingStore((s) => s.getAllBookings);

  const myBookings = useMemo(() => {
    if (!user) return [];
    return getUserBookings(user.id);
  }, [user, getUserBookings]);

  const upcomingBookings = useMemo(
    () => myBookings.filter((b) => b.status === 'confirmed'),
    [myBookings]
  );

  const completedBookings = useMemo(
    () => myBookings.filter((b) => b.status === 'completed'),
    [myBookings]
  );

  const cancelledBookings = useMemo(
    () => myBookings.filter((b) => b.status === 'cancelled'),
    [myBookings]
  );

  return {
    bookings: myBookings,
    upcomingBookings,
    completedBookings,
    cancelledBookings,
    addBooking,
    cancelBooking,
    getBookingsByTurf,
    getBookingById,
    getAllBookings,
  };
}
