// ============================================================================
// REFUND & DISPUTE API SERVICE (FRONTEND ADAPTER)
// ============================================================================
// Future Backend Endpoints:
// - POST /api/v1/bookings/:id/cancel       Body: { reason }
// - GET  /api/v1/bookings/:id/refund       Headers: Bearer <token>
// - POST /api/v1/refunds/:id/dispute       Body: { disputeReason, evidenceUrl }
// ============================================================================

import { apiClient, type ApiResponse } from './client';
import type { RefundRecord, DisputeRecord, RefundStatus } from '@/types';

export const refundApi = {
  /**
   * Future: POST /api/v1/bookings/:id/cancel
   */
  async cancelBookingWithRefund(
    bookingId: string,
    reason: string
  ): Promise<ApiResponse<{ success: boolean; refundAmount: number; refundStatus: RefundStatus }>> {
    return apiClient(`/bookings/${bookingId}/cancel`, {
      method: 'POST',
      body: { reason },
      mockFallback: () => ({
        success: true,
        refundAmount: 650,
        refundStatus: 'PROCESSING',
      }),
    });
  },

  /**
   * Future: GET /api/v1/bookings/:id/refund
   */
  async getRefundStatus(bookingId: string): Promise<ApiResponse<RefundRecord>> {
    return apiClient(`/bookings/${bookingId}/refund`, {
      method: 'GET',
      mockFallback: () => ({
        id: `ref-${bookingId}`,
        bookingId,
        userId: 'user-1',
        amount: 650,
        status: 'PROCESSING',
        refundMethod: 'Original Payment Method (UPI)',
        processedAt: new Date().toISOString(),
        notes: 'Expected credit in your account within 2-4 business hours.',
      }),
    });
  },

  /**
   * Future: POST /api/v1/refunds/:id/dispute
   */
  async raiseDispute(
    bookingId: string,
    reason: string
  ): Promise<ApiResponse<DisputeRecord>> {
    return apiClient(`/refunds/${bookingId}/dispute`, {
      method: 'POST',
      body: { reason },
      mockFallback: () => ({
        id: `disp-${Date.now()}`,
        bookingId,
        userId: 'user-1',
        userName: 'Ayush Sharma',
        turfId: 'champions-arena',
        turfName: 'Champions Arena',
        ownerId: 'owner-1',
        reason,
        amount: 650,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      }),
    });
  },
};
