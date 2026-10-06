// ============================================================================
// AVAILABILITY VIOLATION & NEGATIVE MARKING API (FRONTEND ADAPTER)
// ============================================================================
// Future Backend Endpoints:
// - GET  /api/v1/owners/me/availability-score        Headers: Bearer <ownerToken>
// - GET  /api/v1/owners/me/violations                Headers: Bearer <ownerToken>
// - GET  /api/v1/admin/availability-violations       Headers: Bearer <adminToken>
// - POST /api/v1/admin/availability-violations/:id/resolve  Body: { resolutionNote, action }
// ============================================================================

import { apiClient, type ApiResponse } from './client';
import { mockViolations } from '@/data/turfs';
import type { AvailabilityViolation, AvailabilityAccuracy, PenaltyEvent } from '@/types';

export const availabilityViolationApi = {
  /**
   * Future: GET /api/v1/owners/me/availability-score
   */
  async getOwnerScore(ownerId: string): Promise<ApiResponse<AvailabilityAccuracy>> {
    return apiClient('/owners/me/availability-score', {
      method: 'GET',
      mockFallback: () => {
        const ownerViolations = mockViolations.filter((v) => v.ownerId === ownerId);
        const totalPoints = ownerViolations.reduce((sum, v) => sum + v.negativePoints, 0);

        return {
          ownerId,
          accuracyScore: Math.max(70, 100 - totalPoints),
          totalSlotsEvaluated: 120,
          accurateSlotsCount: 118,
          violationsCount: ownerViolations.length,
          activeWarningsCount: ownerViolations.filter((v) => v.status === 'WARNING_ISSUED').length,
          negativePointsTotal: totalPoints,
          riskLevel: totalPoints > 20 ? 'HIGH' : totalPoints > 10 ? 'ELEVATED' : 'LOW',
          suspensionThreshold: 50,
          lastAuditedAt: new Date().toISOString(),
        };
      },
    });
  },

  /**
   * Future: GET /api/v1/owners/me/violations
   */
  async getOwnerViolations(ownerId: string): Promise<ApiResponse<AvailabilityViolation[]>> {
    return apiClient('/owners/me/violations', {
      method: 'GET',
      mockFallback: () => mockViolations.filter((v) => v.ownerId === ownerId),
    });
  },

  /**
   * Future: GET /api/v1/admin/availability-violations
   */
  async getAdminViolations(): Promise<ApiResponse<AvailabilityViolation[]>> {
    return apiClient('/admin/availability-violations', {
      method: 'GET',
      mockFallback: () => mockViolations,
    });
  },

  /**
   * Future: POST /api/v1/admin/availability-violations/:id/resolve
   */
  async resolveViolation(
    violationId: string,
    resolutionNote: string,
    adminId: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient(`/admin/availability-violations/${violationId}/resolve`, {
      method: 'POST',
      body: { resolutionNote, adminId },
      mockFallback: () => ({ success: true }),
    });
  },
};
