// ============================================================================
// AVAILABILITY API SERVICE (FRONTEND ADAPTER)
// ============================================================================
// Future Backend Endpoints:
// - GET    /api/v1/turfs/:turfId/availability        Query: { date }
// - PATCH  /api/v1/turfs/:turfId/availability        Body: { date, startTime, status }
// - POST   /api/v1/turfs/:turfId/availability/bulk   Body: { date, startTimes: string[], status }
// - POST   /api/v1/turfs/:turfId/availability/hold   Body: { date, startTime, userId }
// - DELETE /api/v1/turfs/:turfId/availability/hold   Body: { date, startTime }
// ============================================================================

import { apiClient, type ApiResponse } from './client';
import type { TurfSlot, SlotStatus } from '@/types';

export const availabilityApi = {
  /**
   * Future: GET /api/v1/turfs/:turfId/availability?date={date}
   */
  async getAvailability(turfId: string, date: string): Promise<ApiResponse<TurfSlot[]>> {
    return apiClient(`/turfs/${turfId}/availability?date=${date}`, {
      method: 'GET',
      mockFallback: () => [],
    });
  },

  /**
   * Future: PATCH /api/v1/turfs/:turfId/availability
   */
  async updateSlotStatus(
    turfId: string,
    date: string,
    startTime: string,
    status: SlotStatus
  ): Promise<ApiResponse<{ success: boolean; slotId: string }>> {
    return apiClient(`/turfs/${turfId}/availability`, {
      method: 'PATCH',
      body: { date, startTime, status },
      mockFallback: () => ({
        success: true,
        slotId: `${turfId}_${date}_${startTime.replace(/\s+/g, '')}`,
      }),
    });
  },

  /**
   * Future: POST /api/v1/turfs/:turfId/availability/bulk
   */
  async bulkUpdate(
    turfId: string,
    date: string,
    startTimes: string[],
    status: SlotStatus
  ): Promise<ApiResponse<{ success: boolean; updatedCount: number }>> {
    return apiClient(`/turfs/${turfId}/availability/bulk`, {
      method: 'POST',
      body: { date, startTimes, status },
      mockFallback: () => ({
        success: true,
        updatedCount: startTimes.length,
      }),
    });
  },

  /**
   * Future: POST /api/v1/turfs/:turfId/availability/hold
   */
  async holdSlot(
    turfId: string,
    date: string,
    startTime: string,
    userId: string
  ): Promise<ApiResponse<{ success: boolean; heldUntil: string }>> {
    return apiClient(`/turfs/${turfId}/availability/hold`, {
      method: 'POST',
      body: { date, startTime, userId },
      mockFallback: () => {
        const heldUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        return { success: true, heldUntil };
      },
    });
  },

  /**
   * Future: DELETE /api/v1/turfs/:turfId/availability/hold
   */
  async releaseHold(
    turfId: string,
    date: string,
    startTime: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient(`/turfs/${turfId}/availability/hold`, {
      method: 'DELETE',
      body: { date, startTime },
      mockFallback: () => ({ success: true }),
    });
  },
};
