import { defineStore } from "pinia";
import { epigramService } from "@/services";
import type { EpigramRead, EpigramCreate, LoadingState } from "@/types/epigram";

interface EpigramState extends LoadingState {
  currentEpigram: EpigramRead | null;
  epigramQueue: EpigramRead[];
  userEpigrams: EpigramRead[];
  queueMinSize: number;
  batchSize: number;
}

// Static property to track last refill time
const refillQueueState = {
  lastRefillTime: 0,
};

export const useEpigramStore = defineStore("epigram", {
  state: (): EpigramState => ({
    currentEpigram: null,
    epigramQueue: [],
    userEpigrams: [],
    isLoading: false,
    error: null,
    queueMinSize: 2, // Refetch when queue has 2 or fewer items
    batchSize: 5, // Fetch 5 epigrams at a time
  }),

  actions: {
    setCurrentEpigram(epigram: EpigramRead): void {
      this.currentEpigram = epigram;
    },

    async loadInitialEpigram(): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        // Fetch initial batch
        const epigrams = await epigramService.getRandomEpigramsBatch(
          this.batchSize
        );

        if (epigrams && epigrams.length > 0) {
          this.currentEpigram = epigrams[0] || null;
          this.epigramQueue = epigrams.slice(1);
        } else {
          // Handle empty response
          this.currentEpigram = null;
        }
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Failed to load epigram";
      } finally {
        this.isLoading = false;
      }
    },

    async loadNextEpigram(): Promise<void> {
      if (this.epigramQueue.length === 0) {
        return this.loadInitialEpigram();
      }

      const nextEpigram = this.epigramQueue.shift();
      this.currentEpigram = nextEpigram || null;

      // Refill queue in background if low
      if (this.epigramQueue.length <= this.queueMinSize) {
        void this.refillQueue();
      }
    },

    async refillQueue(): Promise<void> {
      // Prevent multiple refill calls in quick succession
      if (this.isLoading) return;

      // Use static variable to track last refill time
      const now = Date.now();
      if (
        refillQueueState.lastRefillTime &&
        now - refillQueueState.lastRefillTime < 10000
      ) {
        return;
      }
      refillQueueState.lastRefillTime = now;

      try {
        const currentId = this.currentEpigram?.id;
        const newEpigrams = await epigramService.getRandomEpigramsBatch(
          this.batchSize,
          currentId
        );

        if (!newEpigrams || newEpigrams.length === 0) return;

        // Add new epigrams to queue, avoiding duplicates with both current epigram and queue
        const existingIds = new Set<number>([
          ...(this.currentEpigram?.id ? [this.currentEpigram.id] : []),
          ...this.epigramQueue.map((e) => e.id),
        ]);

        // Filter out duplicates and add to end of queue
        const uniqueEpigrams = newEpigrams.filter(
          (epigram) => !existingIds.has(epigram.id)
        );

        // Only add to queue, don't change current epigram
        if (uniqueEpigrams.length > 0) {
          this.epigramQueue.push(...uniqueEpigrams);
        }
      } catch (error) {
        console.warn("Failed to refill epigram queue:", error);
      }
    },

    async submitEpigram(epigramData: EpigramCreate): Promise<EpigramRead> {
      this.isLoading = true;
      this.error = null;

      try {
        const newEpigram = await epigramService.createEpigram(epigramData);
        if (newEpigram) {
          this.userEpigrams.unshift(newEpigram);
          return newEpigram;
        }
        throw new Error("Failed to create epigram");
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Failed to submit epigram";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async loadUserEpigrams(): Promise<void> {
      try {
        const epigrams = await epigramService.getMyEpigrams();
        if (epigrams) {
          this.userEpigrams = epigrams;
        }
      } catch (error) {
        console.warn("Failed to load user epigrams:", error);
      }
    },

    clearError(): void {
      this.error = null;
    },
  },

  getters: {
    hasEpigrams: (state): boolean => state.currentEpigram !== null,
    queueLength: (state): number => state.epigramQueue.length,
    isQueueLow: (state): boolean =>
      state.epigramQueue.length <= state.queueMinSize,
  },
});
