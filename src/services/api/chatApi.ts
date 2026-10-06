// ============================================================================
// CHAT & CONCIERGE API SERVICE (FRONTEND CLIENT BOUNDARY)
// ============================================================================
// Future Backend Endpoints:
// - POST /api/v1/chat/message          Body: { message, conversationId, userContext }
// - GET  /api/v1/chat/suggestions      Query: { city, sport }
// - DELETE /api/v1/chat/session/:id    Params: { id }
//
// When the real backend is connected:
// 1. Set API_CONFIG.USE_MOCK = false
// 2. The client will post to the Node.js/FastAPI LLM agent orchestrator
// ============================================================================

import { apiClient, type ApiResponse } from './client';
import { playerConciergeService, type ConciergeQueryResult } from '../ai/playerConciergeService';

export interface ChatMessagePayload {
  message: string;
  conversationId?: string;
  userContext?: {
    userId?: string;
    userName?: string;
    city?: string;
    membershipTier?: string;
    rewardPoints?: number;
  };
}

export const chatApi = {
  /**
   * Future: POST /api/v1/chat/message
   */
  async sendMessage(payload: ChatMessagePayload): Promise<ApiResponse<ConciergeQueryResult>> {
    return apiClient<ConciergeQueryResult>('/chat/message', {
      method: 'POST',
      body: payload,
      mockFallback: async () => {
        return playerConciergeService.processPlayerQuery(payload.message, payload.userContext);
      },
    });
  },

  /**
   * Future: GET /api/v1/chat/suggestions
   */
  async getSuggestedPrompts(): Promise<ApiResponse<string[]>> {
    return apiClient<string[]>('/chat/suggestions', {
      method: 'GET',
      mockFallback: () => [
        'Find football turfs in Whitefield',
        'Compare Annual Pass vs Pro',
        'Any cricket pitch available tonight?',
        'How do I redeem my TurfPoints?',
        'What is the cancellation policy?',
      ],
    });
  },
};
