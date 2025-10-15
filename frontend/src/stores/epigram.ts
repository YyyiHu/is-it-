import { defineStore } from "pinia";
import { epigramService } from "@/services";
import { autoReloadService } from "@/services/features/auto-reload.service";
import { useNotificationStore } from "@/stores/notification";
import { queryClient } from "@/lib/query-client";
import type { EpigramRead, EpigramCreate } from "@/types/epigram";
import type { AsyncOperationState } from "@/types/state";

interface EpigramState extends AsyncOperationState {
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
      this._setCurrentEpigramAndReset(epigram);
    },

    removeFromQueue(epigramId: number): void {
      this.epigramQueue = this.epigramQueue.filter(
        (epigram: EpigramRead) => epigram.id !== epigramId
      );
    },

    updateCurrentEpigram(updatedEpigram: EpigramRead): void {
      if (this.currentEpigram?.id === updatedEpigram.id) {
        this._setCurrentEpigramAndReset(updatedEpigram);
      }

      const queueIndex = this.epigramQueue.findIndex(
        (e: EpigramRead) => e.id === updatedEpigram.id
      );
      if (queueIndex !== -1) {
        this.epigramQueue[queueIndex] = updatedEpigram;
      }
    },

    async handleCurrentEpigramDeleted(deletedEpigramId: number): Promise<void> {
      if (this.currentEpigram?.id === deletedEpigramId) {
        await this.loadNextEpigram();
      }

      this.removeFromQueue(deletedEpigramId);
    },

    _setCurrentEpigramAndReset(epigram: EpigramRead | null): void {
      this.currentEpigram = epigram;
      if (epigram) {
        autoReloadService.reset();
      }
    },

    async loadInitialEpigram(): Promise<void> {
      if (this.isLoading) return;

      this.isLoading = true;
      this.error = null;

      try {
        const epigrams = await epigramService.getRandomEpigramsBatch(
          this.batchSize
        );

        if (epigrams?.length > 0) {
          this._setCurrentEpigramAndReset(epigrams[0] || null);
          this.epigramQueue = epigrams.slice(1);
        } else {
          this._setCurrentEpigramAndReset(null);
        }
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Failed to load epigram";
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Load the next epigram from the queue or fetch new ones if empty
     */
    async loadNextEpigram(): Promise<void> {
      if (this.epigramQueue.length === 0) {
        return this.loadInitialEpigram();
      }

      const nextEpigram = this.epigramQueue.shift() || null;
      this._setCurrentEpigramAndReset(nextEpigram);

      // Refill queue in background if running low
      if (this.epigramQueue.length <= this.queueMinSize) {
        void this.refillQueue();
      }
    },

    /**
     * Refill the queue with new epigrams when it's running low
     */
    async refillQueue(): Promise<void> {
      // Prevent multiple refill calls in quick succession
      if (this.isLoading) return;

      // Throttle refill requests to max once per 10 seconds
      const now = Date.now();
      const THROTTLE_MS = 10000;
      if (
        refillQueueState.lastRefillTime &&
        now - refillQueueState.lastRefillTime < THROTTLE_MS
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

        if (!newEpigrams?.length) return;

        // Create a set of existing IDs to avoid duplicates
        const existingIds = new Set<number>([
          ...(this.currentEpigram?.id ? [this.currentEpigram.id] : []),
          ...this.epigramQueue.map((e: EpigramRead) => e.id),
        ]);

        const uniqueEpigrams = newEpigrams.filter(
          (epigram: EpigramRead) => !existingIds.has(epigram.id)
        );
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
      const notificationStore = useNotificationStore();

      try {
        const newEpigram = await epigramService.createEpigram(epigramData);
        if (!newEpigram) {
          throw new Error("Failed to create epigram");
        }

        // Invalidate user epigrams query to refresh history
        queryClient.invalidateQueries({ queryKey: ["userEpigrams"] });

        notificationStore.success("Epigram submitted successfully");

        return newEpigram;
      } catch (error: any) {
        if (error.status === 409) {
          notificationStore.error("This epigram already exists");
          this.error = "Epigram already exists";
        } else {
          notificationStore.error("Failed to submit epigram");
          this.error =
            error instanceof Error ? error.message : "Failed to submit epigram";
        }
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
