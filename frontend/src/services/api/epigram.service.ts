import { BaseApiService } from "../core/base-api.service";
import type { EpigramRead, EpigramCreate } from "@/types/epigram";
import type { PaginatedResponse } from "@/types/api";

/**
 * Epigram service for fetching and managing epigrams
 */
class EpigramService extends BaseApiService {
  // Removed unused getRandomEpigram method

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
   * Get epigrams submitted by the current user with pagination
   */
  async getMyEpigrams(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<EpigramRead>> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    return this.get(`/epigrams/mine?${params}`);
  }

  /**
   * Update an existing epigram
   */
  async updateEpigram(
    id: number,
    epigram: Partial<EpigramCreate>
  ): Promise<EpigramRead> {
    return this.put<EpigramRead>(`/epigrams/${id}`, epigram);
  }

  /**
   * Delete an epigram
   */
  async deleteEpigram(id: number): Promise<void> {
    return this.delete<void>(`/epigrams/${id}`);
  }
}

// Export singleton instance
export const epigramService = new EpigramService();
