// ============================================================================
// MEMBERSHIP API SERVICE (FRONTEND ADAPTER)
// ============================================================================
// Future Backend Endpoints:
// - GET  /api/v1/memberships/plans      Public plans catalog
// - GET  /api/v1/memberships/me         Headers: Bearer <token>
// - POST /api/v1/memberships/subscribe  Body: { planId, paymentMethod }
// - POST /api/v1/memberships/cancel     Body: { reason }
// ============================================================================

import { apiClient, type ApiResponse } from './client';
import { membershipPlans } from '@/data/membership';
import type { MembershipPlan, UserMembership, MembershipTier } from '@/types';

export const membershipApi = {
  /**
   * Future: GET /api/v1/memberships/plans
   */
  async getPlans(): Promise<ApiResponse<MembershipPlan[]>> {
    return apiClient('/memberships/plans', {
      method: 'GET',
      mockFallback: () => membershipPlans,
    });
  },

  /**
   * Future: GET /api/v1/memberships/me
   */
  async getMyMembership(userId: string): Promise<ApiResponse<UserMembership>> {
    return apiClient('/memberships/me', {
      method: 'GET',
      mockFallback: () => {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        return {
          id: `mem-${userId}`,
          userId,
          planId: 'free',
          tier: 'free' as MembershipTier,
          startDate: '2026-01-01T00:00:00Z',
          expiryDate: nextMonth.toISOString(),
          status: 'ACTIVE',
          autoRenew: true,
          usedBookingsThisMonth: 3,
          freeCancellationsRemaining: 2,
        };
      },
    });
  },

  /**
   * Future: POST /api/v1/memberships/subscribe
   */
  async subscribe(tier: MembershipTier): Promise<ApiResponse<{ success: boolean; tier: MembershipTier }>> {
    return apiClient('/memberships/subscribe', {
      method: 'POST',
      body: { tier },
      mockFallback: () => ({ success: true, tier }),
    });
  },

  /**
   * Future: POST /api/v1/memberships/cancel
   */
  async cancel(reason?: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient('/memberships/cancel', {
      method: 'POST',
      body: { reason },
      mockFallback: () => ({ success: true }),
    });
  },
};
