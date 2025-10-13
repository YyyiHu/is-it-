import { defineStore } from "pinia";
import { epigramService } from "@/services";
import { autoReloadService } from "@/services/features/auto-reload.service";
import type { EpigramRead, EpigramCreate, LoadingState } from "@/types/epigram";

interface EpigramState extends LoadingState {
  currentEpigram: EpigramRead | null;
  epigramQueue: EpigramRead[];
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
    isLoading: false,
    error: null,
    queueMinSize: 2, // Refetch when queue has 2 or fewer items
    batchSize: 5, // Fetch 5 epigrams at a time
  }),

  actions: {
    setCurrentEpigram(epigram: EpigramRead): void {
      this.currentEpigram = epigram;
      // Reset timer when new epigram is displayed
      autoReloadService.reset();
    },

    removeFromQueue(epigramId: number): void {
      this.epigramQueue = this.epigramQueue.filter(
        (epigram) => epigram.id !== epigramId
      );
    },

    updateCurrentEpigram(updatedEpigram: EpigramRead): void {
      // Update the current epigram if it matches
      if (this.currentEpigram?.id === updatedEpigram.id) {
        this.currentEpigram = updatedEpigram;
      }

      // Also update in queue if it exists there
      const queueIndex = this.epigramQueue.findIndex(
        (e) => e.id === updatedEpigram.id
      );
      if (queueIndex !== -1) {
        this.epigramQueue[queueIndex] = updatedEpigram;
      }
    },

    async handleCurrentEpigramDeleted(deletedEpigramId: number): Promise<void> {
      // If the currently displayed epigram was deleted, load the next one
      if (this.currentEpigram?.id === deletedEpigramId) {
        await this.loadNextEpigram();
      }

      // Also remove from queue if it exists there
      this.removeFromQueue(deletedEpigramId);
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
          // Reset timer when initial epigram is loaded
          autoReloadService.reset();
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

      // Reset timer when new epigram is loaded
      autoReloadService.reset();

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
        // Silent fail for background queue refill
      }
    },

    async submitEpigram(epigramData: EpigramCreate): Promise<EpigramRead> {
      this.isLoading = true;
      this.error = null;

      try {
        const newEpigram = await epigramService.createEpigram(epigramData);
        if (newEpigram) {
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
