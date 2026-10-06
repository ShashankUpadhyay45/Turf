// ============================================================================
// TURF API SERVICE (FRONTEND ADAPTER)
// ============================================================================
// Future Backend Endpoints:
// - GET /api/v1/turfs                    Query: { city, sport, minPrice, maxPrice, rating }
// - GET /api/v1/turfs/:id                Params: { id }
// - GET /api/v1/turfs/nearby             Query: { lat, lng, radius }
// - GET /api/v1/turfs/search             Query: { query }
// ============================================================================

import { apiClient, type ApiResponse } from './client';
import { turfs } from '@/data/turfs';
import type { Turf, Sport } from '@/types';
import { calculateDistance } from '../location/locationService';

export interface TurfFilterParams {
  city?: string;
  sport?: Sport;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  area?: string;
  amenities?: string[];
  onlyAvailable?: boolean;
}

export const turfApi = {
  /**
   * Future: GET /api/v1/turfs
   */
  async getTurfs(filters?: TurfFilterParams): Promise<ApiResponse<Turf[]>> {
    return apiClient('/turfs', {
      method: 'GET',
      mockFallback: () => {
        let result = turfs.filter((t) => t.approvalStatus === 'APPROVED');

        if (filters?.city && filters.city !== 'All') {
          result = result.filter((t) => t.city.toLowerCase() === filters.city!.toLowerCase());
        }
        if (filters?.sport) {
          result = result.filter((t) => t.sports.includes(filters.sport!));
        }
        if (filters?.minPrice !== undefined) {
          result = result.filter((t) => t.pricePerHour >= filters.minPrice!);
        }
        if (filters?.maxPrice !== undefined) {
          result = result.filter((t) => t.pricePerHour <= filters.maxPrice!);
        }
        if (filters?.rating !== undefined) {
          result = result.filter((t) => t.rating >= filters.rating!);
        }
        if (filters?.area && filters.area !== 'All Areas') {
          result = result.filter((t) => t.area.toLowerCase() === filters.area!.toLowerCase());
        }
        if (filters?.onlyAvailable) {
          result = result.filter((t) => t.available);
        }

        return result;
      },
    });
  },

  /**
   * Future: GET /api/v1/turfs/:id
   */
  async getTurfById(id: string): Promise<ApiResponse<Turf>> {
    return apiClient(`/turfs/${id}`, {
      method: 'GET',
      mockFallback: () => {
        const found = turfs.find((t) => t.id === id);
        if (!found) {
          throw new Error(`Turf with ID ${id} not found.`);
        }
        return found;
      },
    });
  },

  /**
   * Future: GET /api/v1/turfs/nearby?lat={lat}&lng={lng}&radius={radius}
   */
  async getNearbyTurfs(lat: number, lng: number, radiusKm: number = 25): Promise<ApiResponse<Turf[]>> {
    return apiClient('/turfs/nearby', {
      method: 'GET',
      mockFallback: () => {
        return turfs
          .filter((t) => t.approvalStatus === 'APPROVED')
          .map((t) => ({
            ...t,
            distance: calculateDistance(lat, lng, t.latitude, t.longitude),
          }))
          .filter((t) => (t.distance ?? 999) <= radiusKm)
          .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
      },
    });
  },

  /**
   * Future: GET /api/v1/turfs/search?q={query}
   */
  async searchTurfs(query: string): Promise<ApiResponse<Turf[]>> {
    return apiClient('/turfs/search', {
      method: 'GET',
      mockFallback: () => {
        const q = query.toLowerCase().trim();
        if (!q) return turfs.filter((t) => t.approvalStatus === 'APPROVED');
        return turfs.filter(
          (t) =>
            t.approvalStatus === 'APPROVED' &&
            (t.name.toLowerCase().includes(q) ||
              t.area.toLowerCase().includes(q) ||
              t.city.toLowerCase().includes(q) ||
              t.sports.some((s) => s.toLowerCase().includes(q)))
        );
      },
    });
  },
};
