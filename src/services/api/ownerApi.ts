// ============================================================================
// OWNER API SERVICE (FRONTEND ADAPTER WITH STRICT OWNER ISOLATION)
// ============================================================================
// Note: Owner must NEVER see another owner's private operational data.
// In the frontend mock layer, all queries filter strictly by current ownerId.
//
// Future Backend Endpoints:
// - GET    /api/v1/owner/turfs          Headers: Bearer <token> (Returns only caller's turfs)
// - GET    /api/v1/owner/turfs/:id      Headers: Bearer <token>
// - POST   /api/v1/owner/turfs          Body: Partial<Turf>
// - PATCH  /api/v1/owner/turfs/:id      Body: Partial<Turf>
// - DELETE /api/v1/owner/turfs/:id      Headers: Bearer <token>
// - GET    /api/v1/owner/stats          Headers: Bearer <token>
// ============================================================================

import { apiClient, type ApiResponse } from './client';
import { turfs } from '@/data/turfs';
import type { Turf } from '@/types';

export interface OwnerDashboardStats {
  totalTurfs: number;
  todaysBookingsCount: number;
  availableSlotsCount: number;
  bookedSlotsCount: number;
  maintenanceSlotsCount: number;
  monthlyRevenue: number;
  occupancyPercent: number;
  averageRating: number;
  pendingListingsCount: number;
  accuracyScore: number;
  negativePoints: number;
}

export const ownerApi = {
  /**
   * Future: GET /api/v1/owner/turfs
   * Strictly filters turfs belonging to the authenticated owner.
   */
  async getMyTurfs(ownerId: string): Promise<ApiResponse<Turf[]>> {
    return apiClient('/owner/turfs', {
      method: 'GET',
      mockFallback: () => {
        return turfs.filter((t) => t.ownerId === ownerId);
      },
    });
  },

  /**
   * Future: GET /api/v1/owner/turfs/:id
   */
  async getMyTurfById(ownerId: string, turfId: string): Promise<ApiResponse<Turf>> {
    return apiClient(`/owner/turfs/${turfId}`, {
      method: 'GET',
      mockFallback: () => {
        const found = turfs.find((t) => t.id === turfId && t.ownerId === ownerId);
        if (!found) {
          throw new Error('Turf not found or you do not have permission to view it.');
        }
        return found;
      },
    });
  },

  /**
   * Future: POST /api/v1/owner/turfs
   */
  async createTurf(ownerId: string, data: Partial<Turf>): Promise<ApiResponse<Turf>> {
    return apiClient('/owner/turfs', {
      method: 'POST',
      body: data,
      mockFallback: () => {
        const newTurf: Turf = {
          id: `turf-${Date.now()}`,
          name: data.name ?? 'New Sports Turf',
          sports: data.sports ?? ['football'],
          area: data.area ?? 'Rajpur Road',
          city: data.city ?? 'Dehradun',
          distance: 1.0,
          rating: 0,
          reviewsCount: 0,
          pricePerHour: data.pricePerHour ?? 700,
          peakPricePerHour: data.peakPricePerHour ?? 900,
          weekendPricePerHour: data.weekendPricePerHour ?? 850,
          verified: false,
          verificationStatus: 'DOCUMENTS_PENDING',
          imageVerified: false,
          amenities: data.amenities ?? ['Floodlights', 'Parking', 'Washroom'],
          image: data.image ?? turfs[0]!.image,
          images: data.images ?? [turfs[0]!.image],
          available: false,
          blurb: data.blurb ?? 'New artificial sports arena.',
          ownerId,
          ownerName: 'Champions Sports Group',
          address: data.address ?? 'Dehradun, Uttarakhand',
          latitude: data.latitude ?? 30.3165,
          longitude: data.longitude ?? 78.0322,
          operatingHours: data.operatingHours ?? { open: '06:00 AM', close: '11:00 PM' },
          approvalStatus: 'PENDING_REVIEW',
          submittedAt: new Date().toISOString(),
          trustScore: 80,
          accuracyScore: 90,
        };
        return newTurf;
      },
    });
  },

  /**
   * Future: PATCH /api/v1/owner/turfs/:id
   */
  async updateTurf(
    ownerId: string,
    turfId: string,
    updates: Partial<Turf>
  ): Promise<ApiResponse<Turf>> {
    return apiClient(`/owner/turfs/${turfId}`, {
      method: 'PATCH',
      body: updates,
      mockFallback: () => {
        const existing = turfs.find((t) => t.id === turfId && t.ownerId === ownerId);
        if (!existing) {
          throw new Error('Turf not found or unauthorized.');
        }
        return { ...existing, ...updates };
      },
    });
  },

  /**
   * Future: GET /api/v1/owner/stats
   */
  async getOwnerDashboardStats(ownerId: string): Promise<ApiResponse<OwnerDashboardStats>> {
    return apiClient('/owner/stats', {
      method: 'GET',
      mockFallback: () => {
        const myTurfs = turfs.filter((t) => t.ownerId === ownerId);
        const pendingCount = myTurfs.filter((t) => t.approvalStatus === 'PENDING_REVIEW').length;

        return {
          totalTurfs: myTurfs.length,
          todaysBookingsCount: 14,
          availableSlotsCount: 22,
          bookedSlotsCount: 18,
          maintenanceSlotsCount: 2,
          monthlyRevenue: 148500,
          occupancyPercent: 79.4,
          averageRating: 4.8,
          pendingListingsCount: pendingCount,
          accuracyScore: 98,
          negativePoints: 0,
        };
      },
    });
  },
};
