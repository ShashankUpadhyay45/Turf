// ============================================================================
// WAITLIST API SERVICE (FRONTEND ADAPTER)
// ============================================================================
// Future Backend Endpoints:
// - POST   /api/v1/turfs/:turfId/waitlist   Body: { date, startTime, sport }
// - DELETE /api/v1/turfs/:turfId/waitlist   Body: { waitlistId }
// - GET    /api/v1/users/me/waitlist        Headers: Bearer <token>
// ============================================================================

import { apiClient, type ApiResponse } from './client';
import { mockWaitlist } from '@/data/turfs';
import type { WaitlistEntry, Sport } from '@/types';

export const waitlistApi = {
  /**
   * Future: POST /api/v1/turfs/:turfId/waitlist
   */
  async joinWaitlist(
    turfId: string,
    turfName: string,
    date: string,
    startTime: string,
    sport: Sport
  ): Promise<ApiResponse<WaitlistEntry>> {
    return apiClient(`/turfs/${turfId}/waitlist`, {
      method: 'POST',
      body: { date, startTime, sport },
      mockFallback: () => {
        const entry: WaitlistEntry = {
          id: `wait-${Date.now()}`,
          turfId,
          turfName,
          userId: 'user-1',
          userName: 'Ayush Sharma',
          date,
          startTime,
          endTime: '08:00 PM',
          sport,
          position: mockWaitlist.length + 1,
          status: 'WAITING',
          createdAt: new Date().toISOString(),
        };
        mockWaitlist.push(entry);
        return entry;
      },
    });
  },

  /**
   * Future: DELETE /api/v1/turfs/:turfId/waitlist
   */
  async leaveWaitlist(waitlistId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient(`/waitlist/${waitlistId}`, {
      method: 'DELETE',
      mockFallback: () => ({ success: true }),
    });
  },

  /**
   * Future: GET /api/v1/users/me/waitlist
   */
  async getMyWaitlist(): Promise<ApiResponse<WaitlistEntry[]>> {
    return apiClient('/users/me/waitlist', {
      method: 'GET',
      mockFallback: () => mockWaitlist,
    });
  },
};
