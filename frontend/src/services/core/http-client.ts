import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import type { ApiError } from "@/types/api";

/**
 * Base HTTP client that handles API requests and responses
 * Uses Axios for HTTP operations with configured interceptors
 */
export class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      withCredentials: true, // For cookie-based auth
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        if (error.response) {
          // Handle 401 Unauthorized - session expired
          if (error.response.status === 401) {
            // Import needed at runtime to avoid circular dependency
            const { useAuthStore } = await import("@/stores/auth");
            const authStore = useAuthStore();

            // Only show notification if we're currently authenticated
            if (authStore.isAuthenticated) {
              // Import notification store to show message
              const { useNotificationStore } = await import(
                "@/stores/notification"
              );
              const notificationStore = useNotificationStore();
              notificationStore.warning(
                "Session Expired",
                "Your session has expired.",
                60000 // Show for 1 minute (60,000 ms)
              );

              // Redirect to home page
              window.location.href = "/";
            }
          }

          // Server responded with error status
          const apiError = new Error(
            error.response.data?.detail ||
              `HTTP ${error.response.status}: ${error.response.statusText}`
          ) as Error & { status: number };
          apiError.status = error.response.status;
          return Promise.reject(apiError);
        } else if (error.request) {
          // Request was made but no response received
          return Promise.reject(
            new Error(
              "Cannot connect to backend. Please check your connection."
            )
          );
        } else {
          // Something else happened
          return Promise.reject(new Error("An unexpected error occurred"));
        }
      }
    );
  }

  /**
   * Perform a GET request
   */
  protected async get<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.get<T>(endpoint, config);
    return response.data;
  }

  /**
   * Perform a POST request
   */
  protected async post<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(endpoint, data, config);
    return response.data;
  }

  /**
   * Perform a PUT request
   */
  protected async put<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(endpoint, data, config);
    return response.data;
  }

  /**
   * Perform a DELETE request
   */
  protected async delete<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.delete<T>(endpoint, config);
    return response.data;
  }

  /**
   * Update base configuration if needed
   */
  public updateConfig(config: Partial<AxiosRequestConfig>): void {
    Object.assign(this.client.defaults, config);
  }
}
