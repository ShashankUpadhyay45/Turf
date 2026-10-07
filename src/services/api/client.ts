// ============================================================================
// PLAYO API CLIENT ABSTRACTION (FRONTEND CLIENT BOUNDARY)
// ============================================================================
// Connects frontend to the Express + MongoDB backend running on port 5001.
// Supports automatic token attachment and resilient mock fallback if offline.
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

const getBaseUrl = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5001/api/v1';
  }
  return '/api/v1';
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT_MS: 10000,
  // When false, connects directly to the live backend server
  USE_MOCK: false,
  SIMULATED_LATENCY_MS: 200,
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
    message: message ?? 'Request successful',
    meta: {
      ...meta,
      timestamp: new Date().toISOString(),
    },
    statusCode: 200,
  };
}

/**
 * HTTP request client wrapper connecting to live backend with resilient fallback
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

  // If explicit mock mode requested, use mock handler
  if (API_CONFIG.USE_MOCK) {
    await simulateNetworkLatency();
    if (mockFallback) {
      const data = await mockFallback();
      return createSuccessResponse(data, `Mock response for ${method} ${endpoint}`, { isMock: true });
    }
    throw new Error(`[Mock Client] No mock handler defined for ${method} ${endpoint}`);
  }

  // Live Backend Connection
  try {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('playo-auth-token') : null;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

    const url = `${API_CONFIG.BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const errorMsg = errorJson.message || `Request failed with status ${response.status}`;
      // On client error (4xx) throw immediately
      if (response.status >= 400 && response.status < 500) {
        throw new Error(errorMsg);
      }
      throw new Error(errorMsg);
    }

    const json = await response.json();
    return {
      success: json.success !== undefined ? json.success : true,
      data: json.data !== undefined ? json.data : json,
      message: json.message,
      statusCode: response.status,
    };
  } catch (err: any) {
    // If backend is unreachable or timed out and a mockFallback is available, gracefully fall back
    if (mockFallback && (err.name === 'AbortError' || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError'))) {
      console.warn(`[API Client] Live request to ${endpoint} unreachable (${err.message}). Using fallback data.`);
      const data = await mockFallback();
      return createSuccessResponse(data, `Fallback response for ${method} ${endpoint}`, { isFallback: true });
    }
    throw err;
  }
}
