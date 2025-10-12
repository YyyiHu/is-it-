import { BaseApiService } from "../core/base-api.service";
import type { UserCreate, UserLogin, UserRead } from "../types";

/**
 * Authentication service for user registration, login, and session management
 */
class AuthService extends BaseApiService {
  /**
   * Register a new user
   */
  async register(userData: UserCreate): Promise<UserRead> {
    return this.post<UserRead>("/auth/register", userData);
  }

  /**
   * Log in a user
   * The backend will set HTTP-only cookies for authentication
   */
  async login(credentials: UserLogin): Promise<UserRead> {
    return this.post<UserRead>("/auth/login", credentials);
  }

  /**
   * Log out the current user
   * The backend will clear the HTTP-only cookie
   */
  async logout(): Promise<{ message: string }> {
    return this.post<{ message: string }>("/auth/logout");
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<UserRead> {
    return this.get<UserRead>("/auth/me");
  }

  /**
   * Verify if the current token is valid
   */
  async verifyToken(): Promise<{
    valid: boolean;
    user_id: number;
    username: string;
  }> {
    return this.post<{ valid: boolean; user_id: number; username: string }>(
      "/auth/verify-token"
    );
  }
}

// Export singleton instance
export const authService = new AuthService();
