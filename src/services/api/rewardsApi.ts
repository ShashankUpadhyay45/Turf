// ============================================================================
// REWARDS API SERVICE (FRONTEND ADAPTER)
// ============================================================================
// Future Backend Endpoints:
// - GET  /api/v1/rewards/balance         Headers: Bearer <token>
// - GET  /api/v1/rewards/transactions    Headers: Bearer <token>
// - POST /api/v1/rewards/redeem          Body: { redemptionOptionId }
// ============================================================================

import { apiClient, type ApiResponse } from './client';
import { mockRedemptionOptions } from '@/data/turfs';
import type { RewardTransaction, RedemptionOption } from '@/types';

export const rewardsApi = {
  /**
   * Future: GET /api/v1/rewards/balance
   */
  async getBalance(userId: string): Promise<ApiResponse<{ points: number }>> {
    return apiClient('/rewards/balance', {
      method: 'GET',
      mockFallback: () => ({ points: 2450 }),
    });
  },

  /**
   * Future: GET /api/v1/rewards/transactions
   */
  async getTransactions(userId: string): Promise<ApiResponse<RewardTransaction[]>> {
    return apiClient('/rewards/transactions', {
      method: 'GET',
      mockFallback: () => [
        {
          id: 'tx-1',
          userId,
          type: 'earned',
          points: 120,
          description: 'Match completed at Champions Arena',
          createdAt: '2026-09-24T20:00:00Z',
        },
        {
          id: 'tx-2',
          userId,
          type: 'redeemed',
          points: -500,
          description: 'Redeemed ₹100 Off Coupon (PLAYO100)',
          createdAt: '2026-09-20T12:00:00Z',
        },
        {
          id: 'tx-3',
          userId,
          type: 'bonus',
          points: 100,
          description: 'Profile completion welcome reward',
          createdAt: '2026-01-15T10:00:00Z',
        },
      ],
    });
  },

  /**
   * Future: POST /api/v1/rewards/redeem
   */
  async redeemVoucher(
    redemptionOptionId: string
  ): Promise<ApiResponse<{ success: boolean; couponCode: string; discountValue: number }>> {
    return apiClient('/rewards/redeem', {
      method: 'POST',
      body: { redemptionOptionId },
      mockFallback: () => {
        const option = mockRedemptionOptions.find((o) => o.id === redemptionOptionId);
        return {
          success: true,
          couponCode: option?.couponCode ?? `VOUCH-${Math.floor(1000 + Math.random() * 9000)}`,
          discountValue: option?.discountValue ?? 100,
        };
      },
    });
  },
};
