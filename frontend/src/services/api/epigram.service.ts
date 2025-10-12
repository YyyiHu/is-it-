import { BaseApiService } from "../core/base-api.service";
import type { EpigramRead, EpigramCreate } from "@/types/epigram";

/**
 * Epigram service for fetching and managing epigrams
 */
class EpigramService extends BaseApiService {
  /**
   * Get a random epigram
   * @param currentId Optional ID to exclude from results
   */
  async getRandomEpigram(currentId?: number): Promise<EpigramRead> {
    const params = currentId ? `?current_id=${currentId}` : "";
    return this.get<EpigramRead>(`/epigrams/random${params}`);
  }

  /**
   * Get a batch of random epigrams
   * @param count Number of epigrams to fetch
   * @param currentId Optional ID to exclude from results
   */
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

  /**
   * Create a new epigram
   */
  async createEpigram(epigram: EpigramCreate): Promise<EpigramRead> {
    return this.post<EpigramRead>("/epigrams/", epigram);
  }

  /**
   * Get epigrams submitted by the current user
   */
  async getMyEpigrams(): Promise<EpigramRead[]> {
    return this.get<EpigramRead[]>("/epigrams/mine");
  }
}

// Export singleton instance
export const epigramService = new EpigramService();