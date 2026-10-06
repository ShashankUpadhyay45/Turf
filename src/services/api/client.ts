// ============================================================================
// PLAYO API CLIENT ABSTRACTION (FRONTEND CLIENT BOUNDARY)
// ============================================================================
// NOTE: This abstraction prepares the frontend for future REST/GraphQL endpoints.
// In this frontend phase, it operates entirely with local mock data and simulated latency.
// It exposes standard HTTP-like verbs (get, post, put, patch, delete) with typed responses.
//
// When the real Node.js/MERN backend is deployed:
// 1. Change USE_MOCK_DATA to false
// 2. Point API_BASE_URL to process.env.VITE_API_URL || 'http://localhost:5000/api/v1'
// 3. The request() method will automatically switch from local dispatch to window.fetch()
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  meta?: Record<string, any>;
  statusCode: number;
}

export interface ApiError {
  success: false;
  message: string;
  statusCode: number;
  errors?: Array<{ field: string; message: string }>;
}

export const API_CONFIG = {
  BASE_URL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '/api/v1',
  TIMEOUT_MS: 10000,
  USE_MOCK: true, // Strictly frontend mock mode
  SIMULATED_LATENCY_MS: 300,
};

/**
 * Helper to simulate network latency for authentic UI loading states
 */
export async function simulateNetworkLatency(ms: number = API_CONFIG.SIMULATED_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Standard typed API response factory
 */
export function createSuccessResponse<T>(data: T, message?: string, meta?: Record<string, any>): ApiResponse<T> {
  return {
    success: true,
    data,
    message: message ?? 'Request successful (mock adapter)',
    meta: {
      ...meta,
      isMock: true,
      timestamp: new Date().toISOString(),
    },
    statusCode: 200,
  };
}

/**
 * Future-ready HTTP request client wrapper
 */
export async function apiClient<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
    mockFallback?: () => T | Promise<T>;
  } = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, mockFallback } = options;

  // In Frontend-First mode, bypass actual network request and return mock fallback
  if (API_CONFIG.USE_MOCK) {
    await simulateNetworkLatency();
    if (mockFallback) {
      const data = await mockFallback();
      return createSuccessResponse(data, `Mock response for ${method} ${endpoint}`);
    }
    throw new Error(`[Mock Client] No mock handler defined for ${method} ${endpoint}`);
  }

  // --- FUTURE BACKEND CONNECTION CODE (DO NOT ENABLE IN THIS TASK) ---
  /*
  const token = localStorage.getItem('playo-auth-token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.message || `Request failed with status ${response.status}`);
  }

  return response.json();
  */
  throw new Error('Real network requests are disabled in frontend-only development mode.');
}
