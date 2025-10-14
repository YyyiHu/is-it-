/**
 * API related types
 */

/**
 * Standard API error response
 */
export interface ApiError {
  detail: string;
  status?: number;
}

/**
 * Generic API response with pagination
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}
