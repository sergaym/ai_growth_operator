/**
 * Common API types used across services
 */

/**
 * Type for API responses matching the expected structure in service layers
 */
export type ApiResponse<T> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}; 