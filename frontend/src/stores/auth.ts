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

  const register = async (userData: UserCreate) => {
    isLoading.value = true;
    clearError();

    try {
      // Register the user - backend will automatically set HTTP-only cookie
      const newUser = await authService.register(userData);
      setUser(newUser);
      return newUser;
    } catch (err: any) {
      const errorMessage = err.message || "Registration failed";
      setError(errorMessage);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const login = async (credentials: UserLogin) => {
    isLoading.value = true;
    clearError();

    try {
      // Login - backend will set HTTP-only cookie and return user data
      const userData = await authService.login(credentials);
      setUser(userData);
      return userData;
    } catch (err: any) {
      const errorMessage = err.message || "Login failed";
      setError(errorMessage);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    isLoading.value = true;
    clearError();

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
