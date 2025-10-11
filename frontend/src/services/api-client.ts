import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

export interface ApiError {
  detail: string;
  status?: number;
}

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      withCredentials: true,
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
      (error) => {
        if (error.response) {
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

  protected async get<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.get<T>(endpoint, config);
    return response.data;
  }

  protected async post<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(endpoint, data, config);
    return response.data;
  }

  protected async put<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(endpoint, data, config);
    return response.data;
  }

  protected async delete<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.delete<T>(endpoint, config);
    return response.data;
  }

  // Method to update base configuration if needed
  public updateConfig(config: Partial<AxiosRequestConfig>): void {
    Object.assign(this.client.defaults, config);
  }

  // Method to add custom headers
  public setAuthToken(token: string): void {
    this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  public removeAuthToken(): void {
    delete this.client.defaults.headers.common["Authorization"];
  }
}

export default ApiClient;
