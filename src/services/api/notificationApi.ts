// ============================================================================
// NOTIFICATION API SERVICE (FRONTEND ADAPTER)
// ============================================================================
// Future Backend Endpoints:
// - GET   /api/v1/notifications               Headers: Bearer <token>
// - PATCH /api/v1/notifications/:id/read      Headers: Bearer <token>
// - PATCH /api/v1/notifications/read-all      Headers: Bearer <token>
// ============================================================================

import { apiClient, type ApiResponse } from './client';
import { mockNotifications } from '@/data/turfs';
import type { NotificationItem } from '@/types';

export const notificationApi = {
  /**
   * Future: GET /api/v1/notifications
   */
  async getNotifications(userId: string): Promise<ApiResponse<NotificationItem[]>> {
    return apiClient('/notifications', {
      method: 'GET',
      mockFallback: () => mockNotifications.filter((n) => n.userId === userId || n.userId === 'user-1'),
    });
  },

  /**
   * Future: PATCH /api/v1/notifications/:id/read
   */
  async markAsRead(notificationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
      mockFallback: () => ({ success: true }),
    });
  },

  /**
   * Future: PATCH /api/v1/notifications/read-all
   */
  async markAllAsRead(userId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient('/notifications/read-all', {
      method: 'PATCH',
      mockFallback: () => ({ success: true }),
    });
  },
};
