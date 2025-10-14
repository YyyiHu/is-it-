/**
 * Authentication related types
 */

/**
 * User creation data
 */
export interface UserCreate {
  username: string;
  password: string;
}

/**
 * User login credentials
 */
export interface UserLogin {
  username: string;
  password: string;
}

/**
 * User data returned from API
 */
export interface UserRead {
  id: number;
  username: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Authentication token
 */
export interface Token {
  access_token: string;
  token_type: string;
}
