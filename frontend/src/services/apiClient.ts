// API client with automatic token refresh

// Interface for refresh token response
export interface RefreshTokenResponse {
  access_token: string;
  refresh_token?: string;
  user?: any;
}

// For storing the refresh token promise to prevent multiple refresh requests
let refreshPromise: Promise<string | null> | null = null;
// Queue of requests that are waiting for token refresh
const requestQueue: (() => void)[] = [];

// Process all requests in the queue with the new token
function processQueue() {
  requestQueue.forEach(callback => callback());
  requestQueue.length = 0;
}

// Reset the refresh promise
function resetRefreshPromise() {
  refreshPromise = null;
}

/**
 * Fetch API with authorization and automatic token refresh
 */
/**
 * Main API client function that handles authentication and token refresh
 */
export async function apiClient<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // Prepare the request with authorization
  
  // Add authorization header if access token exists
  const accessToken = localStorage.getItem('access_token');
  
  // Create a new headers object
  const newHeaders: HeadersInit = {
    'Content-Type': 'application/json'
  };

  // Merge with existing headers if they exist
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        newHeaders[key] = value;
      });
    } else if (typeof options.headers === 'object') {
      Object.assign(newHeaders, options.headers);
    }
  }
  
  // Add auth header if token exists
  if (accessToken) {
    newHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  // First attempt with current token
  try {
    const response = await fetch(url, {
      ...options,
      headers: newHeaders,
      credentials: 'include', // Always include credentials
    });

    // If the response is OK, return the data
    if (response.ok) {
      return await response.json();
    }

    // If unauthorized (401) and we have a token, try to refresh it
    if (response.status === 401 && accessToken) {
      // If a refresh is already in progress, add this request to the queue
      if (refreshPromise) {
        return new Promise((resolve, reject) => {
          requestQueue.push(() => {
            // Retry the request with the new token
            apiClient<T>(url, options)
              .then(resolve)
              .catch(reject);
          });
        });
      }

      // Start the token refresh process
      refreshPromise = refreshAccessToken();

      try {
        const newToken = await refreshPromise;
        // Reset the promise after it resolves/rejects
        resetRefreshPromise();

        if (!newToken) {
          // If refresh failed, throw error - refresh function will handle redirects if needed
          throw new Error('Session expired. Please login again.');
        }

        // Process any queued requests
        processQueue();

        // Retry the original request with new token
        return await apiClient<T>(url, options);
      } catch (refreshError) {
        // Reset the promise if refresh fails
        resetRefreshPromise();
        // Clear the queue with errors
        requestQueue.forEach(callback => callback());
        requestQueue.length = 0;
        
        console.error('Token refresh failed:', refreshError);
        throw new Error('Authentication failed. Please login again.');
      }
    }

    // For other error types, throw with details
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || `API Error: ${response.status} - ${response.statusText}`;
    throw new Error(errorMessage);
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(`Unable to connect to the API. Please check your internet connection.`);
    }
    throw error;
  }
}

/**
 * Helper function to clear all authentication tokens
 * Used when tokens expire or authentication fails
 */
function clearAuthTokens(): void {
  // Clear localStorage tokens
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  
  // Clear all potential auth cookies
  document.cookie = 'auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = 'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

/**
 * Refresh the access token using the refresh token
 * This is exposed so it can be called directly by useAuth
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    // Get the refresh token from localStorage
    const refreshToken = localStorage.getItem('refresh_token');
    
    // If no refresh token is available, fail immediately
    if (!refreshToken) {
      console.error('No refresh token available for token refresh');
      // Clear all tokens
      clearAuthTokens();
      
      // Redirect to login if we're in a browser context
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        console.log('Redirecting to login due to missing refresh token');
        window.location.href = '/login';
      }
      return null;
    }
    // The backend expects refresh_token as a query parameter, not in the body
    const refreshEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh?refresh_token=${encodeURIComponent(refreshToken)}`;
      
    // Prepare request options - making sure to include cookies
    const requestOptions: RequestInit = {
      method: 'POST',
      credentials: 'include', // Include cookies for HTTP-only refresh token
      headers: {
        'Content-Type': 'application/json',
      }
    };

    // Make the refresh request
    const response = await fetch(refreshEndpoint, requestOptions);
    // Handle refresh token failures
    if (!response.ok) {
      console.error('Failed to refresh token, status:', response.status);
      
      // Clear all tokens
      clearAuthTokens();
      
      // On 401 or 403, the token is invalid or expired, redirect to login
      if ((response.status === 401 || response.status === 403) && 
          typeof window !== 'undefined' && 
          !window.location.pathname.includes('/login')) {
        console.log('Redirecting to login due to invalid refresh token');
        window.location.href = '/login';
      }
      
      throw new Error(`Failed to refresh token: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.access_token) {
      // Store in localStorage
      localStorage.setItem('access_token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      
      // Sync with cookie for middleware compatibility
      document.cookie = `auth-token=${data.access_token}; path=/; max-age=${60 * 60 * 2}; SameSite=Lax`;  // 2 hours
      
      return data.access_token;
    }
    return null;
  } catch (e) {
    console.error('Token refresh error:', e);
    clearAuthTokens();
    return null;
  }
}
