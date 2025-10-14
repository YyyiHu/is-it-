import { useMutation } from "@tanstack/vue-query";
import { epigramService } from "@/services";
import { useNotificationStore } from "@/stores/notification";
import { useEpigramStore } from "@/stores/epigram";
import { queryClient } from "@/lib/query-client";
import type { EpigramRead } from "@/types/epigram";

/**
 * Composable for epigram mutation operations (delete, update)
 */
export function useEpigramMutations(): {
  deleteEpigramMutation: ReturnType<typeof useMutation<unknown, Error, number>>;
  updateEpigramMutation: ReturnType<
    typeof useMutation<
      EpigramRead,
      Error,
      { id: number; data: Partial<EpigramRead> }
    >
  >;
} {
  const notificationStore = useNotificationStore();
  const epigramStore = useEpigramStore();

  /**
   * Delete epigram mutation
   */
  const deleteEpigramMutation = useMutation({
    mutationFn: async (epigramId: number) => {
      return await epigramService.deleteEpigram(epigramId);
    },
    onSuccess: (_, epigramId) => {
      // Handle deletion in the epigram store (will load next epigram if current was deleted)
      epigramStore.handleCurrentEpigramDeleted(epigramId);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["userEpigrams"] });
      notificationStore.success("Epigram deleted successfully");
    },
    onError: () => {
      notificationStore.error("Failed to delete epigram");
    },
  });

  /**
   * Update epigram mutation
   */
  const updateEpigramMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<EpigramRead>;
    }) => {
      return await epigramService.updateEpigram(id, data);
    },
    onSuccess: (updatedEpigram) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["userEpigrams"] });
      notificationStore.success("Epigram updated successfully");
      return updatedEpigram;
    },
    onError: () => {
      notificationStore.error("Failed to update epigram");
    },
  });

  return {
    deleteEpigramMutation,
    updateEpigramMutation,
  };
}
