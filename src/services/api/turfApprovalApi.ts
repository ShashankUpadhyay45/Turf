// ============================================================================
// TURF LISTING APPROVAL API SERVICE (FRONTEND ADAPTER)
// ============================================================================
// Workflow Stages:
// OWNER: Draft -> Submit for Review -> Pending
// ADMIN: Review Request -> Approve / Reject / Request Changes
// OWNER: Approved -> Published | Rejected -> Edit -> Resubmit
//
// Future Backend Endpoints:
// - POST /api/v1/turfs/:id/submit                     Headers: Bearer <ownerToken>
// - GET  /api/v1/admin/turf-requests                  Headers: Bearer <adminToken>
// - POST /api/v1/admin/turf-requests/:id/approve      Headers: Bearer <adminToken>
// - POST /api/v1/admin/turf-requests/:id/reject       Body: { reason }
// - POST /api/v1/admin/turf-requests/:id/request-changes Body: { changesRequired }
// ============================================================================

import { apiClient, type ApiResponse } from './client';
import { turfs } from '@/data/turfs';
import type { TurfApprovalRequest, ListingApprovalStatus } from '@/types';

export const turfApprovalApi = {
  /**
   * Future: POST /api/v1/turfs/:id/submit
   */
  async submitTurfForReview(turfId: string): Promise<ApiResponse<{ success: boolean; status: ListingApprovalStatus }>> {
    return apiClient(`/turfs/${turfId}/submit`, {
      method: 'POST',
      mockFallback: () => ({
        success: true,
        status: 'PENDING_REVIEW',
      }),
    });
  },

  /**
   * Future: GET /api/v1/admin/turf-requests
   */
  async getPendingRequests(): Promise<ApiResponse<TurfApprovalRequest[]>> {
    return apiClient('/admin/turf-requests', {
      method: 'GET',
      mockFallback: () => {
        return turfs
          .filter((t) => t.approvalStatus !== 'APPROVED')
          .map((t) => ({
            id: `req-${t.id}`,
            turfId: t.id,
            turfName: t.name,
            ownerId: t.ownerId,
            ownerName: t.ownerName ?? 'Turf Owner',
            ownerEmail: 'owner@champions.com',
            ownerPhone: '+91 98765 11111',
            city: t.city,
            area: t.area,
            sports: t.sports,
            hourlyRate: t.pricePerHour,
            status: t.approvalStatus,
            submittedAt: t.submittedAt ?? '2026-09-27T08:30:00Z',
            rejectionReason: t.rejectionReason,
            changesRequestedNote: t.changesRequestedNote,
            statusHistory: [
              {
                status: 'DRAFT',
                changedAt: '2026-09-26T10:00:00Z',
                changedBy: 'Owner',
                note: 'Initial listing creation',
              },
              {
                status: t.approvalStatus,
                changedAt: t.submittedAt ?? '2026-09-27T08:30:00Z',
                changedBy: 'Owner',
                note: 'Submitted for verification',
              },
            ],
          }));
      },
    });
  },

  /**
   * Future: POST /api/v1/admin/turf-requests/:id/approve
   */
  async approveTurf(turfId: string, adminId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient(`/admin/turf-requests/${turfId}/approve`, {
      method: 'POST',
      body: { adminId },
      mockFallback: () => ({ success: true }),
    });
  },

  /**
   * Future: POST /api/v1/admin/turf-requests/:id/reject
   */
  async rejectTurf(
    turfId: string,
    reason: string,
    adminId: string
  ): Promise<ApiResponse<{ success: boolean; reason: string }>> {
    return apiClient(`/admin/turf-requests/${turfId}/reject`, {
      method: 'POST',
      body: { reason, adminId },
      mockFallback: () => ({ success: true, reason }),
    });
  },

  /**
   * Future: POST /api/v1/admin/turf-requests/:id/request-changes
   */
  async requestChanges(
    turfId: string,
    note: string,
    adminId: string
  ): Promise<ApiResponse<{ success: boolean; note: string }>> {
    return apiClient(`/admin/turf-requests/${turfId}/request-changes`, {
      method: 'POST',
      body: { note, adminId },
      mockFallback: () => ({ success: true, note }),
    });
  },
};
