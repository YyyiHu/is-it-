import { HttpClient } from "./http-client";

// API base URL - Vite proxy will handle routing to backend
const API_BASE_URL = "/api";

/**
 * Base API service that extends the HttpClient
 * All other API services will extend this class
 */
export class BaseApiService extends HttpClient {
  constructor() {
    super(API_BASE_URL);
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: string }> {
    return this.get<{ status: string }>("/health");
  }
}
