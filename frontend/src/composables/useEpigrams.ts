import { computed, ref, type ComputedRef } from "vue";
import { useQuery, useMutation } from "@tanstack/vue-query";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import { epigramService } from "@/services";
import type { EpigramRead, EpigramCreate } from "@/types/epigram";
import { queryClient } from "@/lib/query-client";

export function useEpigrams(): {
  epigramBatch: ComputedRef<EpigramRead[]>;
  userEpigrams: ComputedRef<EpigramRead[]>;
  currentEpigramId: ComputedRef<number | undefined>;
  isBatchLoading: ComputedRef<boolean>;
  isUserEpigramsLoading: ComputedRef<boolean>;
  isSubmitting: ComputedRef<boolean>;
  isBatchError: ComputedRef<boolean>;
  isUserEpigramsError: ComputedRef<boolean>;
  submitError: ComputedRef<unknown>;
  submitEpigram: (data: EpigramCreate) => void;
  getNextEpigram: () => EpigramRead | undefined;
  refreshEpigrams: () => Promise<EpigramRead | undefined>;
  refetchBatch: () => Promise<unknown>;
  refetchUserEpigrams: () => Promise<unknown>;
} {
  const authStore = useAuthStore();
  const notificationStore = useNotificationStore();

  // Current epigram being displayed
  const currentEpigramId = ref<number | undefined>(undefined);

  // Query for fetching a batch of random epigrams (for queue)
  const epigramBatchQuery = useQuery({
    queryKey: ["epigramBatch"],
    queryFn: async (): Promise<EpigramRead[]> => {
      return epigramService.getRandomEpigramsBatch(5, currentEpigramId.value);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });

  // Query for fetching user's submitted epigrams
  const userEpigramsQuery = useQuery({
    queryKey: ["userEpigrams", authStore.user?.id],
    queryFn: async (): Promise<EpigramRead[]> => {
      if (!authStore.isAuthenticated) return [];
      return epigramService.getMyEpigrams();
    },
    enabled: computed(() => authStore.isAuthenticated),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for submitting a new epigram
  const submitEpigramMutation = useMutation({
    mutationFn: async (epigramData: EpigramCreate): Promise<EpigramRead> => {
      if (!authStore.isAuthenticated) {
        throw new Error("Must be authenticated to submit epigrams");
      }
      return epigramService.createEpigram(epigramData);
    },
    onSuccess: (newEpigram) => {
      // Add to user's epigrams cache
      queryClient.setQueryData(
        ["userEpigrams", authStore.user?.id],
        (old: EpigramRead[] = []) => [newEpigram, ...old]
      );

      // Invalidate batch query to get fresh epigrams
      queryClient.invalidateQueries({ queryKey: ["epigramBatch"] });

      // Success notification is handled by the component
    },
    onError: (error: any) => {
      console.error("Failed to submit epigram:", error);

      // Handle specific error cases
      if (error.message?.includes("already exists")) {
        notificationStore.error("This epigram already exists");
      } else {
        notificationStore.error("Failed to submit epigram");
      }
    },
  });

  // Function to get next epigram from batch
  const getNextEpigram = (): EpigramRead | undefined => {
    const batch = epigramBatchQuery.data.value;
    if (!batch || batch.length === 0) return undefined;

    // Get first epigram from batch
    const nextEpigram = batch[0];
    if (!nextEpigram) return undefined;

    currentEpigramId.value = nextEpigram.id;

    // If batch is getting low, refetch in background
    if (batch.length <= 2) {
      epigramBatchQuery.refetch();
    }

    return nextEpigram;
  };

  // Function to manually refresh (get new batch)
  const refreshEpigrams = async () => {
    currentEpigramId.value = undefined; // Reset current to get fresh batch
    await epigramBatchQuery.refetch();
    return getNextEpigram();
  };

  return {
    // Data
    epigramBatch: computed(() => epigramBatchQuery.data.value || []),
    userEpigrams: computed(() => userEpigramsQuery.data.value || []),
    currentEpigramId: computed(() => currentEpigramId.value),

    // Loading states
    isBatchLoading: computed(() => epigramBatchQuery.isLoading.value),
    isUserEpigramsLoading: computed(() => userEpigramsQuery.isLoading.value),
    isSubmitting: computed(() => submitEpigramMutation.isPending.value),

    // Error states
    isBatchError: computed(() => epigramBatchQuery.isError.value),
    isUserEpigramsError: computed(() => userEpigramsQuery.isError.value),
    submitError: computed(() => submitEpigramMutation.error.value),

    // Actions
    submitEpigram: submitEpigramMutation.mutate,
    getNextEpigram,
    refreshEpigrams,

    // Utilities
    refetchBatch: epigramBatchQuery.refetch,
    refetchUserEpigrams: userEpigramsQuery.refetch,
  };
}
