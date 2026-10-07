import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Booking, BookingStatus } from '@/types';
import champions from '@/assets/turf-champions.webp';
import skyline from '@/assets/turf-skyline.webp';
import greenfield from '@/assets/turf-greenfield.webp';

interface BookingState {
  bookings: Booking[];
  
  addBooking: (booking: Booking) => void;
  cancelBooking: (bookingId: string, reason?: string) => boolean;
  markCompleted: (bookingId: string) => boolean;
  markNoShow: (bookingId: string) => boolean;
  getUserBookings: (userId: string) => Booking[];
  getBookingsByTurf: (turfId: string) => Booking[];
  getBookingsByOwner: (ownerId: string) => Booking[];
  getBookingById: (bookingId: string) => Booking | undefined;
  getBookingByReference: (referenceCode: string) => Booking | undefined;
  getAllBookings: () => Booking[];
}

const initialBookings: Booking[] = [
  {
    id: 'PL-250925-084',
    referenceCode: 'TB-2026-88124',
    turfId: 'champions-arena',
    turfName: 'Champions Arena',
    turfAddress: 'Rajpur Road, Near Clock Tower, Dehradun',
    turfImage: champions,
    turfLatitude: 30.3398,
    turfLongitude: 78.0644,
    userId: 'user-1',
    userName: 'Ayush Sharma',
    userPhone: '+91 98765 43210',
    userEmail: 'ayush@example.com',
    ownerId: 'owner-1',
    sport: 'football',
    date: '2026-09-30',
    startTime: '07:00 PM',
    endTime: '08:00 PM',
    basePrice: 800,
    membershipDiscount: 80,
    rewardDiscount: 50,
    finalPrice: 670,
    status: 'confirmed',
    rewardPointsEarned: 67,
    createdAt: '2026-09-28T14:30:00Z',
    paymentMethod: 'UPI (Google Pay)',
    paymentStatus: 'PAID',
    qrVerificationCode: 'https://playo.in/verify/TB-2026-88124',
  },
  {
    id: 'PL-250920-062',
    referenceCode: 'TB-2026-77319',
    turfId: 'skyline-kickoff',
    turfName: 'Skyline Kickoff Rooftop',
    turfAddress: 'Clock Tower, Rajpur Road, Dehradun',
    turfImage: skyline,
    turfLatitude: 30.3165,
    turfLongitude: 78.0322,
    userId: 'user-1',
    userName: 'Ayush Sharma',
    userPhone: '+91 98765 43210',
    userEmail: 'ayush@example.com',
    ownerId: 'owner-1',
    sport: 'football',
    date: '2026-09-20',
    startTime: '06:00 PM',
    endTime: '07:00 PM',
    basePrice: 750,
    membershipDiscount: 0,
    rewardDiscount: 50,
    finalPrice: 700,
    status: 'completed',
    rewardPointsEarned: 70,
    createdAt: '2026-09-19T10:00:00Z',
    paymentMethod: 'Credit Card',
    paymentStatus: 'PAID',
    qrVerificationCode: 'https://playo.in/verify/TB-2026-77319',
  },
  {
    id: 'PL-250918-011',
    referenceCode: 'TB-2026-66412',
    turfId: 'greenfield-box',
    turfName: 'Greenfield Box Cricket',
    turfAddress: 'Clement Town, Dehradun',
    turfImage: greenfield,
    turfLatitude: 30.2880,
    turfLongitude: 78.0104,
    userId: 'user-1',
    userName: 'Ayush Sharma',
    userPhone: '+91 98765 43210',
    userEmail: 'ayush@example.com',
    ownerId: 'owner-2',
    sport: 'cricket',
    date: '2026-09-18',
    startTime: '08:00 AM',
    endTime: '09:00 AM',
    basePrice: 500,
    membershipDiscount: 50,
    rewardDiscount: 0,
    finalPrice: 450,
    status: 'completed',
    rewardPointsEarned: 45,
    createdAt: '2026-09-17T12:00:00Z',
    paymentMethod: 'UPI (Paytm)',
    paymentStatus: 'PAID',
    qrVerificationCode: 'https://playo.in/verify/TB-2026-66412',
  },
];

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      bookings: initialBookings,

      addBooking: (booking: Booking) => {
        set((state) => ({
          bookings: [booking, ...state.bookings],
        }));
      },

      cancelBooking: (bookingId: string, reason?: string) => {
        const booking = get().bookings.find((b) => b.id === bookingId || b.referenceCode === bookingId);
        if (!booking || booking.status !== 'confirmed') return false;

        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === booking.id
              ? {
                  ...b,
                  status: 'cancelled',
                  cancellationReason: reason ?? 'User requested cancellation',
                  cancelledAt: new Date().toISOString(),
                  refundStatus: 'PROCESSING',
                  refundAmount: b.finalPrice,
                }
              : b
          ),
        }));
        return true;
      },

      markCompleted: (bookingId: string) => {
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: 'completed' } : b
          ),
        }));
        return true;
      },

      markNoShow: (bookingId: string) => {
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: 'no-show' } : b
          ),
        }));
        return true;
      },

      getUserBookings: (userId: string) => {
        return get().bookings.filter((b) => b.userId === userId);
      },

      getBookingsByTurf: (turfId: string) => {
        return get().bookings.filter((b) => b.turfId === turfId);
      },

      getBookingsByOwner: (ownerId: string) => {
        return get().bookings.filter((b) => b.ownerId === ownerId);
      },

      getBookingById: (bookingId: string) => {
        return get().bookings.find((b) => b.id === bookingId || b.referenceCode === bookingId);
      },

      getBookingByReference: (referenceCode: string) => {
        return get().bookings.find((b) => b.referenceCode === referenceCode || b.id === referenceCode);
      },

      getAllBookings: () => get().bookings,
    }),
    {
      name: 'playo-bookings-v2',
    }
  )
);
