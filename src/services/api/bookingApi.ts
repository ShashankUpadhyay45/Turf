// ============================================================================
// BOOKING API SERVICE (FRONTEND ADAPTER)
// ============================================================================
// Future Backend Endpoints:
// - POST /api/v1/bookings              Body: CreateBookingPayload
// - GET  /api/v1/bookings/:id          Params: { id }
// - GET  /api/v1/bookings/my           Headers: Bearer <token>
// - POST /api/v1/bookings/:id/cancel   Body: { reason }
// - POST /api/v1/bookings/:id/rebook   Body: { newDate, newSlot }
// - GET  /api/v1/turfs/:id/check-slot  Query: { date, startTime }
// ============================================================================

import { apiClient, type ApiResponse } from './client';
import type { Booking, Sport } from '@/types';

export interface CreateBookingPayload {
  turfId: string;
  turfName: string;
  turfAddress?: string;
  turfImage?: string;
  turfLatitude?: number;
  turfLongitude?: number;
  userId: string;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  sport: Sport;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  basePrice: number;
  membershipDiscount: number;
  rewardDiscount: number;
  finalPrice: number;
  paymentMethod: string;
}

export const bookingApi = {
  /**
   * Future: POST /api/v1/bookings
   */
  async createBooking(payload: CreateBookingPayload): Promise<ApiResponse<Booking>> {
    return apiClient('/bookings', {
      method: 'POST',
      body: payload,
      mockFallback: () => {
        const reference = `TB-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        const newBooking: Booking = {
          id: `book-${Date.now()}`,
          referenceCode: reference,
          ...payload,
          status: 'confirmed',
          rewardPointsEarned: Math.round(payload.finalPrice * 0.1),
          createdAt: new Date().toISOString(),
          paymentStatus: 'PAID',
          qrVerificationCode: `https://playo.in/verify/${reference}`,
        };
        return newBooking;
      },
    });
  },

  /**
   * Future: GET /api/v1/bookings/:id
   */
  async getBookingById(bookingId: string): Promise<ApiResponse<Booking | null>> {
    return apiClient(`/bookings/${bookingId}`, {
      method: 'GET',
      mockFallback: () => {
        // Return null if not in memory (Zustand store holds active bookings)
        return null;
      },
    });
  },

  /**
   * Future: GET /api/v1/bookings/my
   */
  async getMyBookings(userId: string): Promise<ApiResponse<Booking[]>> {
    return apiClient('/bookings/my', {
      method: 'GET',
      mockFallback: () => [],
    });
  },

  /**
   * Future: POST /api/v1/bookings/:id/cancel
   */
  async cancelBooking(bookingId: string, reason: string): Promise<ApiResponse<{ success: boolean; refundStatus: string }>> {
    return apiClient(`/bookings/${bookingId}/cancel`, {
      method: 'POST',
      body: { reason },
      mockFallback: () => ({
        success: true,
        refundStatus: 'PROCESSING',
      }),
    });
  },

  /**
   * Future: POST /api/v1/bookings/:id/rebook
   */
  async rebook(bookingId: string, newDate: string, newStartTime: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient(`/bookings/${bookingId}/rebook`, {
      method: 'POST',
      body: { newDate, newStartTime },
      mockFallback: () => ({ success: true }),
    });
  },

  /**
   * Future: GET /api/v1/turfs/:id/check-slot?date={date}&time={time}
   */
  async checkAvailability(turfId: string, date: string, startTime: string): Promise<ApiResponse<{ available: boolean }>> {
    return apiClient(`/turfs/${turfId}/check-slot`, {
      method: 'GET',
      mockFallback: () => ({ available: true }),
    });
  },
};
