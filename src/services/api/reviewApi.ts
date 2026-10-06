// ============================================================================
// REVIEW API SERVICE (FRONTEND ADAPTER)
// ============================================================================
// Future Backend Endpoints:
// - GET  /api/v1/turfs/:turfId/reviews       Public reviews for a venue
// - GET  /api/v1/owner/reviews               Headers: Bearer <ownerToken>
// - POST /api/v1/owner/reviews/:id/respond   Body: { responseMessage }
// - POST /api/v1/reviews                     Body: { bookingId, rating, comment, sportsPlayed }
// ============================================================================

import { apiClient, type ApiResponse } from './client';
import { reviews } from '@/data/turfs';
import type { Review } from '@/types';

export const reviewApi = {
  /**
   * Future: GET /api/v1/turfs/:turfId/reviews
   */
  async getTurfReviews(turfId: string): Promise<ApiResponse<Review[]>> {
    return apiClient(`/turfs/${turfId}/reviews`, {
      method: 'GET',
      mockFallback: () => reviews.filter((r) => r.turfId === turfId),
    });
  },

  /**
   * Future: GET /api/v1/owner/reviews
   */
  async getOwnerReviews(): Promise<ApiResponse<Review[]>> {
    return apiClient('/owner/reviews', {
      method: 'GET',
      mockFallback: () => reviews,
    });
  },

  /**
   * Future: POST /api/v1/owner/reviews/:id/respond
   */
  async respondToReview(
    reviewId: string,
    message: string
  ): Promise<ApiResponse<{ success: boolean; respondedAt: string }>> {
    return apiClient(`/owner/reviews/${reviewId}/respond`, {
      method: 'POST',
      body: { message },
      mockFallback: () => ({
        success: true,
        respondedAt: new Date().toISOString(),
      }),
    });
  },

  /**
   * Future: POST /api/v1/reviews
   */
  async submitReview(reviewData: Partial<Review>): Promise<ApiResponse<Review>> {
    return apiClient('/reviews', {
      method: 'POST',
      body: reviewData,
      mockFallback: () => ({
        id: `rev-${Date.now()}`,
        turfId: reviewData.turfId ?? 'champions-arena',
        userId: reviewData.userId ?? 'user-1',
        userName: reviewData.userName ?? 'Ayush Sharma',
        rating: reviewData.rating ?? 5,
        comment: reviewData.comment ?? 'Awesome turf surface and lighting.',
        sportsPlayed: reviewData.sportsPlayed ?? 'football',
        createdAt: new Date().toISOString(),
        isVerifiedPlay: true,
      }),
    });
  },
};
