// ============================================================================
// OWNER BOOKINGS API SERVICE (FRONTEND ADAPTER)
// ============================================================================
// Future Backend Endpoints:
// - GET   /api/v1/owner/bookings         Query: { turfId, date, status, sport }
// - GET   /api/v1/owner/bookings/:id     Params: { id }
// - PATCH /api/v1/owner/bookings/:id/status Body: { status: 'completed' | 'no-show' | 'cancelled' }
// ============================================================================

import { apiClient, type ApiResponse } from './client';
import type { Booking, BookingStatus, Sport } from '@/types';

export interface OwnerBookingFilters {
  turfId?: string;
  status?: BookingStatus | 'all';
  date?: string;
  sport?: Sport;
}

export const ownerBookingApi = {
  /**
   * Future: GET /api/v1/owner/bookings
   */
  async getOwnerBookings(
    ownerId: string,
    filters?: OwnerBookingFilters
  ): Promise<ApiResponse<Booking[]>> {
    return apiClient('/owner/bookings', {
      method: 'GET',
      mockFallback: () => {
        // Mock sample incoming bookings for the owner
        const mockList: Booking[] = [
          {
            id: 'bk-101',
            referenceCode: 'TB-2026-98124',
            turfId: 'champions-arena',
            turfName: 'Champions Arena',
            userId: 'user-1',
            userName: 'Ayush Sharma',
            userPhone: '+91 98765 43210',
            userEmail: 'ayush@example.com',
            ownerId,
            sport: 'football',
            date: new Date().toISOString().split('T')[0]!,
            startTime: '07:00 PM',
            endTime: '08:00 PM',
            basePrice: 800,
            membershipDiscount: 80,
            rewardDiscount: 50,
            finalPrice: 670,
            status: 'confirmed',
            rewardPointsEarned: 67,
            createdAt: '2026-09-28T14:00:00Z',
            paymentMethod: 'UPI (Google Pay)',
            paymentStatus: 'PAID',
          },
          {
            id: 'bk-102',
            referenceCode: 'TB-2026-98125',
            turfId: 'champions-arena',
            turfName: 'Champions Arena',
            userId: 'user-102',
            userName: 'Vikram Sengupta',
            userPhone: '+91 98765 88888',
            userEmail: 'vikram@example.com',
            ownerId,
            sport: 'cricket',
            date: new Date().toISOString().split('T')[0]!,
            startTime: '08:00 PM',
            endTime: '09:00 PM',
            basePrice: 650,
            membershipDiscount: 0,
            rewardDiscount: 0,
            finalPrice: 650,
            status: 'confirmed',
            rewardPointsEarned: 65,
            createdAt: '2026-09-28T15:30:00Z',
            paymentMethod: 'Card (Visa)',
            paymentStatus: 'PAID',
          },
          {
            id: 'bk-103',
            referenceCode: 'TB-2026-98126',
            turfId: 'skyline-kickoff',
            turfName: 'Skyline Kickoff Rooftop',
            userId: 'user-103',
            userName: 'Riya Malhotra',
            userPhone: '+91 98765 99999',
            userEmail: 'riya@example.com',
            ownerId,
            sport: 'football',
            date: new Date().toISOString().split('T')[0]!,
            startTime: '09:00 PM',
            endTime: '10:00 PM',
            basePrice: 800,
            membershipDiscount: 0,
            rewardDiscount: 100,
            finalPrice: 700,
            status: 'completed',
            rewardPointsEarned: 70,
            createdAt: '2026-09-27T10:00:00Z',
            paymentMethod: 'UPI (PhonePe)',
            paymentStatus: 'PAID',
          },
        ];

        let result = mockList;
        if (filters?.turfId && filters.turfId !== 'all') {
          result = result.filter((b) => b.turfId === filters.turfId);
        }
        if (filters?.status && filters.status !== 'all') {
          result = result.filter((b) => b.status === filters.status);
        }
        return result;
      },
    });
  },

  /**
   * Future: PATCH /api/v1/owner/bookings/:id/status
   */
  async updateBookingStatus(
    bookingId: string,
    status: BookingStatus
  ): Promise<ApiResponse<{ success: boolean; status: BookingStatus }>> {
    return apiClient(`/owner/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: { status },
      mockFallback: () => ({ success: true, status }),
    });
  },
};
