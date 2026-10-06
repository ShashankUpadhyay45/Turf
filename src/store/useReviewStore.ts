import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { reviews as seedReviews } from '@/data/turfs';
import type { Review } from '@/types';

interface ReviewState {
  reviews: Review[];
  addReview: (data: Omit<Review, 'id' | 'createdAt'>) => Review;
  getReviewsByTurfId: (turfId: string) => Review[];
  respondToReview: (reviewId: string, message: string) => boolean;
  deleteReview: (reviewId: string) => boolean;
  getRatingSummary: (turfId: string) => { rating: number; count: number };
}

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      reviews: seedReviews,

      addReview: (data) => {
        const newReview: Review = {
          ...data,
          id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          createdAt: new Date().toISOString(),
          isVerifiedPlay: true,
        };
        set((state) => ({
          reviews: [newReview, ...state.reviews],
        }));
        return newReview;
      },

      getReviewsByTurfId: (turfId: string) => {
        return get().reviews.filter((r) => r.turfId === turfId);
      },

      respondToReview: (reviewId: string, message: string) => {
        const exists = get().reviews.some((r) => r.id === reviewId);
        if (!exists) return false;
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  ownerResponse: {
                    message,
                    respondedAt: new Date().toISOString(),
                  },
                }
              : r
          ),
        }));
        return true;
      },

      deleteReview: (reviewId: string) => {
        set((state) => ({
          reviews: state.reviews.filter((r) => r.id !== reviewId),
        }));
        return true;
      },

      getRatingSummary: (turfId: string) => {
        const turfReviews = get().reviews.filter((r) => r.turfId === turfId);
        if (turfReviews.length === 0) {
          return { rating: 4.8, count: 0 };
        }
        const total = turfReviews.reduce((sum, r) => sum + r.rating, 0);
        const avg = Math.round((total / turfReviews.length) * 10) / 10;
        return { rating: avg, count: turfReviews.length };
      },
    }),
    {
      name: 'playo-reviews',
      partialize: (state) => ({ reviews: state.reviews }),
    }
  )
);
