import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  authService,
  autoReloadService,
  type UserRead,
  type UserCreate,
  type UserLogin,
} from "@/services";

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<UserRead | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!user.value);
  const isGuest = computed(() => !isAuthenticated.value);

  // Actions
  const setError = (message: string | null) => {
    error.value = message;
  };

  const clearError = () => {
    error.value = null;
  };

  const setUser = (userData: UserRead | null) => {
    user.value = userData;
  };

  const initializeAuth = async () => {
    // With HTTP-only cookies
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      // No valid session, user is not authenticated
      clearAuth();
    }
  };

  /**
   * Handle authentication API requests with common error handling
   */
  const handleAuthRequest = async <T>(
    requestFn: () => Promise<T>,
    errorMessage: string
  ): Promise<T> => {
    isLoading.value = true;
    clearError();

    try {
      const result = await requestFn();
      return result;
    } catch (err: any) {
      setError(err.message || errorMessage);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Register a new user
   */
  const register = async (userData: UserCreate) => {
    const newUser = await handleAuthRequest(
      () => authService.register(userData),
      "Registration failed"
    );
    setUser(newUser);
    return newUser;
  };

  /**
   * Log in an existing user
   */
  const login = async (credentials: UserLogin) => {
    const userData = await handleAuthRequest(
      () => authService.login(credentials),
      "Login failed"
    );
    setUser(userData);
    return userData;
  };

  /**
   * Log out the current user
   */
  const logout = async () => {
    isLoading.value = true;
    
    try {
      // Call logout endpoint to clear HTTP-only cookie
      await authService.logout();
    } catch (err) {
      // Ignore logout API errors, we'll clear local state anyway
    } finally {
      clearAuth();
      isLoading.value = false;
    }
  };

  const clearAuth = () => {
    setUser(null);
    clearError();

    // Stop timer on logout
    autoReloadService.stop();
  };

  /**
   * Refresh the current user's data
   */
  const refreshUser = async () => {
    if (!isAuthenticated.value) return;

    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      // If refresh fails, the token might be expired
      clearAuth();
    }
  };

  return {
    // State
    user,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    isGuest,

    // Actions
    setError,
    clearError,
    setUser,
    initializeAuth,
    register,
    login,
    logout,
    clearAuth,
    refreshUser,
  };
});
