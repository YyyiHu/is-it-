import ApiClient from "../api-client";

// Use relative API path - Vite proxy will handle routing to backend
const API_BASE_URL = "/api";

/**
 * Base API service that extends the ApiClient
 * All other API services will extend this class
 */
export class BaseApiService extends ApiClient {
  constructor() {
    super(API_BASE_URL);
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.get<{ status: string }>("/health");
  }
}
