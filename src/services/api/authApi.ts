// ============================================================================
// AUTH API SERVICE (FRONTEND ADAPTER)
// ============================================================================
// Future Backend Endpoints:
// - POST   /api/v1/auth/login           Body: { email, password }
// - POST   /api/v1/auth/register        Body: { name, email, password, role }
// - POST   /api/v1/auth/logout          Headers: Bearer <token>
// - GET    /api/v1/auth/me              Headers: Bearer <token>
// - POST   /api/v1/auth/refresh-session Headers: Bearer <refreshToken>
// - POST   /api/v1/auth/forgot-password Body: { email }
// - POST   /api/v1/auth/reset-password  Body: { token, newPassword }
// ============================================================================

import { apiClient, type ApiResponse } from './client';
import { mockUsers } from '@/data/mock-users';
import type { User, UserRole } from '@/types';

export const authApi = {
  /**
   * Future: POST /api/v1/auth/login
   */
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return apiClient('/auth/login', {
      method: 'POST',
      body: { email, password },
      mockFallback: () => {
        const found = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!found) {
          throw new Error('Invalid email or password.');
        }
        return {
          user: found,
          token: `mock-jwt-token-${found.id}-${Date.now()}`,
        };
      },
    });
  },

  /**
   * Future: POST /api/v1/auth/register
   */
  async register(
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    return apiClient('/auth/register', {
      method: 'POST',
      body: { name, email, password, role },
      mockFallback: () => {
        const newUser: User = {
          id: `user-${Date.now()}`,
          name,
          email,
          role,
          membershipTier: 'free',
          rewardPoints: role === 'player' ? 100 : 0,
          createdAt: new Date().toISOString(),
          isActive: true,
        };
        return {
          user: newUser,
          token: `mock-jwt-token-${newUser.id}-${Date.now()}`,
        };
      },
    });
  },

  /**
   * Future: POST /api/v1/auth/logout
   */
  async logout(): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient('/auth/logout', {
      method: 'POST',
      mockFallback: () => ({ success: true }),
    });
  },

  /**
   * Future: GET /api/v1/auth/me
   */
  async getCurrentUser(userId: string): Promise<ApiResponse<User | null>> {
    return apiClient('/auth/me', {
      method: 'GET',
      mockFallback: () => {
        const user = mockUsers.find((u) => u.id === userId) ?? null;
        return user;
      },
    });
  },

  /**
   * Future: POST /api/v1/auth/refresh-session
   */
  async refreshSession(): Promise<ApiResponse<{ token: string }>> {
    return apiClient('/auth/refresh-session', {
      method: 'POST',
      mockFallback: () => ({
        token: `mock-refreshed-jwt-${Date.now()}`,
      }),
    });
  },

  /**
   * Future: POST /api/v1/auth/forgot-password
   */
  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      mockFallback: () => ({
        message: `Password reset instructions sent to ${email} (mock simulation).`,
      }),
    });
  },

  /**
   * Future: POST /api/v1/auth/reset-password
   */
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient('/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword },
      mockFallback: () => ({ success: true }),
    });
  },
};
