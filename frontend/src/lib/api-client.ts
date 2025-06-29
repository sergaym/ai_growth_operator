/**
 * API Client for interacting with the AI-UGC backend endpoints
 * Uses Next.js native fetch capabilities
 * 
 * NOTE: Token refresh is handled by the central apiClient in /services/apiClient.ts
 */

import type { ApiResponse } from '@/types/api';
import { apiClient as coreApiClient } from '@/services/apiClient';

// Get the API base URL from environment variable with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:80';
const API_VERSION = 'v1';

type RequestOptions = RequestInit & {
  params?: Record<string, string>;
};

// Helper function to get access token from localStorage
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem('access_token');
  }
  return null;
}

/**
 * Handles API errors and authentication redirects
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  // Handle authentication errors
  if (response.status === 401 && typeof window !== 'undefined') {
    // Clear auth token
    document.cookie = 'auth-token=; Max-Age=0; path=/; domain=' + window.location.hostname;
    
    // Redirect to login if not already there
    if (!window.location.pathname.includes('/login')) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
    }
    throw new Error('Authentication required');
  }
  
  // For successful responses, parse JSON
  if (response.ok) {
    const data = await response.json() as T;
    
    // Extract headers into a plain object
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    // Return structured response
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers
    };
  }
  
  // For error responses, try to parse error details
  try {
    const errorData = await response.json();
    throw new Error(errorData.error || errorData.message || 'API request failed');
  } catch (e) {
    // If JSON parsing fails, use status text
    throw new Error(response.statusText || 'API request failed');
  }
}

/**
 * Creates request headers with auth token if available
 */
function createHeaders(customHeaders?: HeadersInit): Headers {
  const headers = new Headers(customHeaders);
  
  // Set content type if not already set
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Add access token if available
  const accessToken = getAuthToken();
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  
  return headers;
}

/**
 * Build URL with optional query parameters
 */
function buildUrl(endpoint: string, options?: RequestOptions): string {
  const url = new URL(`${API_BASE_URL}/api/${API_VERSION}${endpoint}`);
  
  // Add query parameters if provided
  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
  }
  
  return url.toString();
}

/**
 * Base fetch function with error handling and auth
 */
async function fetchApi<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  const { params, ...fetchOptions } = options || {};
  
  // Create request URL with params
  const url = buildUrl(endpoint, { params });
  
  let headers = createHeaders(fetchOptions.headers);
  
  // Make request
  let response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: 'include', // always include cookies for refresh
  });
  // If unauthorized, we want coreApiClient to handle token refresh
  // This will route through the centralized token refresh logic
  if (response.status === 401) {
    console.log('Unauthorized response, delegating to central apiClient for token refresh');
    
    // Use the central apiClient to trigger a token refresh
    try {
      // Make a simple request to trigger the refresh mechanism
      await coreApiClient(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`);
      
      // If successful, retry the original request with new token
      headers = createHeaders(fetchOptions.headers);
      response = await fetch(url, {
        ...fetchOptions,
        headers,
        credentials: 'include',
      });
    } catch (error) {
      // If refresh fails through central mechanism, log out
      console.error('Token refresh failed:', error);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('access_token');
        window.localStorage.removeItem('refresh_token');
      }
      throw new Error('Session expired. Please sign in again.');
    }
  }
  
  // Process the response
  return handleResponse<T>(response);
}

const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    fetchApi<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T>(endpoint: string, data: unknown, options?: RequestOptions) => 
    fetchApi<T>(endpoint, { 
      ...options, 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  
  put: <T>(endpoint: string, data: unknown, options?: RequestOptions) => 
    fetchApi<T>(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  
  delete: <T>(endpoint: string, options?: RequestOptions) => 
    fetchApi<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default apiClient; 