import ApiClient from "./api-client";
import type { EpigramRead, EpigramCreate } from "@/types/epigram";

// Use relative API path - Vite proxy will handle routing to backend
const API_BASE_URL = "/api";

class EpigramApiService extends ApiClient {
  constructor() {
    super(API_BASE_URL);
  }

  async getRandomEpigram(currentId?: number): Promise<EpigramRead> {
    const params = currentId ? `?current_id=${currentId}` : "";
    return this.get<EpigramRead>(`/epigrams/random${params}`);
  }

  async getRandomEpigramsBatch(
    count: number = 5,
    currentId?: number
  ): Promise<EpigramRead[]> {
    const params = new URLSearchParams();
    params.append("count", count.toString());
    if (currentId) {
      params.append("current_id", currentId.toString());
    }

    return this.get<EpigramRead[]>(`/epigrams/random/batch?${params}`);
  }

  async createEpigram(epigram: EpigramCreate): Promise<EpigramRead> {
    return this.post<EpigramRead>("/epigrams/", epigram);
  }

  async getMyEpigrams(): Promise<EpigramRead[]> {
    return this.get<EpigramRead[]>("/epigrams/mine");
  }

  async healthCheck(): Promise<{ status: string }> {
    return this.get<{ status: string }>("/health");
  }
}

// Export singleton instance
export const apiService = new EpigramApiService();

// Also export the class for testing or multiple instances
export { EpigramApiService };
