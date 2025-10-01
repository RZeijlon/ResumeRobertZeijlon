/**
 * API communication type definitions
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  error?: string;
  timestamp: string;
}

/**
 * API error response
 */
export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
  timestamp: string;
}

/**
 * HTTP method types
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Fetch options with typed method
 */
export interface FetchOptions extends Omit<RequestInit, 'method'> {
  method?: HttpMethod;
}
