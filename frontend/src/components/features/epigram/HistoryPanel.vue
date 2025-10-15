<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { X, Edit, Trash2, Calendar, Eye } from "lucide-vue-next";
import { useUiStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import { useEpigramStore } from "@/stores/epigram";
import { useInfiniteQuery, useMutation } from "@tanstack/vue-query";
import { useNotificationStore } from "@/stores/notification";
import { epigramService } from "@/services";
import type { EpigramRead } from "@/types/epigram";
import { BaseButton } from "@/components/shared/forms";
import { AppSpinner, ConfirmationDialog } from "@/components/shared/ui";
import { queryClient } from "@/lib/query-client";
import { autoReloadService } from "@/services/features/auto-reload.service";
import EpigramFormPanel from "./EpigramFormPanel.vue";

interface PaginatedEpigramResponse {
  items: EpigramRead[];
  total: number;
  page: number;
  size: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

const uiStore = useUiStore();
const authStore = useAuthStore();
const epigramStore = useEpigramStore();
const notificationStore = useNotificationStore();

const PAGE_SIZE = 10;

const editingEpigram = ref<EpigramRead | null>(null);
const isEditModalOpen = ref(false);

const showDeleteConfirmation = ref(false);
const epigramToDelete = ref<EpigramRead | null>(null);

const scrollContainer = ref<HTMLElement | null>(null);

const userEpigramsQuery = useInfiniteQuery({
  queryKey: ["userEpigrams", authStore.user?.id?.toString() || ""],
  queryFn: async ({ pageParam = 1 }): Promise<PaginatedEpigramResponse> => {
    if (!authStore.isAuthenticated || !authStore.user?.id) {
      return {
        items: [],
        total: 0,
        page: 1,
        size: PAGE_SIZE,
        pages: 0,
        has_next: false,
        has_prev: false,
      };
    }

    try {
      const result = await epigramService.getMyEpigrams(pageParam, PAGE_SIZE);
      return result;
    } catch (error) {
      console.error("Error fetching epigrams:", error);
      return {
        items: [],
        total: 0,
        page: pageParam,
        size: PAGE_SIZE,
        pages: 0,
        has_next: false,
        has_prev: false,
      };
    }
  },
  enabled: () => {
    return (
      authStore.isAuthenticated &&
      uiStore.isHistoryPanelOpen &&
      !!authStore.user?.id
    );
  },
  initialPageParam: 1,
  getNextPageParam: (lastPage: PaginatedEpigramResponse) => {
    return lastPage.has_next ? lastPage.page + 1 : undefined;
  },
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  retry: (failureCount: number) => failureCount < 3,
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
});

const deleteMutation = useMutation({
  mutationFn: async (epigramId: number) => {
    return epigramService.deleteEpigram(epigramId);
  },
  onSuccess: (_: any, epigramId: number) => {
    epigramStore.handleCurrentEpigramDeleted(epigramId);
    queryClient.invalidateQueries({ queryKey: ["userEpigrams"] });
    notificationStore.success("Epigram deleted successfully");
  },
  onError: () => {
    notificationStore.error("Failed to delete epigram");
  },
});

// Note: Update mutation is now handled in EditEpigramPanel

// Flatten all pages into a single array of epigrams
const allEpigrams = computed(() => {
  try {
    const data = userEpigramsQuery.data?.value;
    if (!data || !data.pages) {
      return [];
    }

    const pages = data.pages || [];

    // Extract items from each paginated response
    const allItems = pages
      .filter(
        (page: PaginatedEpigramResponse) =>
          page && page.items && Array.isArray(page.items)
      )
      .flatMap((page: PaginatedEpigramResponse) => page.items);

    return allItems;
  } catch (error) {
    console.error("Error computing allEpigrams:", error);
    return [];
  }
});

// Total count of loaded epigrams (not total in database)
const totalEpigrams = computed(() => allEpigrams.value.length);

// Loading states for UI feedback
const isLoading = computed(() => userEpigramsQuery.isLoading?.value ?? false);
const isFetchingNextPage = computed(
  () => userEpigramsQuery.isFetchingNextPage?.value ?? false
);
const hasNextPage = computed(
  () => userEpigramsQuery.hasNextPage?.value ?? false
);

// Mutation states
const isDeleting = computed(() => deleteMutation.isPending.value);

// Panel management methods
const closePanel = () => {
  uiStore.closeAllPanels();
  closeEditModal();
};

const openEditModal = (epigram: EpigramRead) => {
  editingEpigram.value = epigram;
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  editingEpigram.value = null;
  isEditModalOpen.value = false;
};

const handleEpigramUpdated = (updatedEpigram: EpigramRead) => {
  // The EditEpigramPanel handles the query invalidation
  // We just need to close the modal
  closeEditModal();
};

const deleteEpigram = (epigram: EpigramRead) => {
  epigramToDelete.value = epigram;
  showDeleteConfirmation.value = true;
};

const confirmDelete = () => {
  if (epigramToDelete.value) {
    deleteMutation.mutate(epigramToDelete.value.id);
  }
  showDeleteConfirmation.value = false;
  epigramToDelete.value = null;
};

const cancelDelete = () => {
  showDeleteConfirmation.value = false;
  epigramToDelete.value = null;
};

const displayEpigram = (epigram: EpigramRead) => {
  // Set the selected epigram as current (this will also reset the timer)
  epigramStore.setCurrentEpigram(epigram);

  // Remove this epigram from the queue to avoid showing it again
  epigramStore.removeFromQueue(epigram.id);

  notificationStore.success("Epigram displayed successfully");
  closePanel();
};

/**
 * INFINITE SCROLL HANDLERS
 */
// Manually trigger loading next page (used by button and scroll handler)
const loadMore = () => {
  if (hasNextPage.value && !isFetchingNextPage.value) {
    userEpigramsQuery.fetchNextPage();
  }
};

// Automatic scroll detection for infinite loading
const handleScroll = () => {
  if (!scrollContainer.value) return;

  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value;
  const threshold = 100; // Trigger when 100px from bottom (optimal UX)

  if (scrollHeight - scrollTop - clientHeight < threshold) {
    loadMore();
  }
};

// Format date for display
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Lifecycle management
watch(
  () => uiStore.isHistoryPanelOpen,
  async (isOpen: boolean) => {
    if (isOpen) {
      closeEditModal();

      if (userEpigramsQuery.isStale?.value) {
        await userEpigramsQuery.refetch();
      }

      await nextTick();
      if (scrollContainer.value) {
        scrollContainer.value.addEventListener("scroll", handleScroll);
      }
    } else {
      if (scrollContainer.value) {
        scrollContainer.value.removeEventListener("scroll", handleScroll);
      }
    }
  }
);
</script>

<template>
  <div
    v-if="uiStore.isHistoryPanelOpen"
    class="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-[1000]"
    @mousedown.self="closePanel"
  >
    <div
      class="history-panel w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div
        class="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0"
      >
        <h3
          class="text-xl font-semibold text-gray-900 m-0 flex items-center gap-2"
        >
          <Calendar :size="24" />
          My Epigrams
        </h3>
        <button
          class="flex items-center justify-center text-gray-400 bg-transparent border-0 outline-none rounded-full w-8 h-8 transition-colors hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
          @click="closePanel"
          aria-label="Close panel"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- Content -->
      <div
        ref="scrollContainer"
        class="overflow-y-auto flex-1"
        style="max-height: calc(100% - 80px)"
        @scroll="handleScroll"
      >
        <!-- Loading state -->
        <div v-if="isLoading" class="p-8 text-center">
          <AppSpinner size="lg" class="mx-auto mb-4" />
          <p class="text-gray-600">Loading your epigrams...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="allEpigrams.length === 0" class="flex flex-col h-full">
          <div class="flex-1 flex flex-col items-center justify-center p-8">
            <div class="flex justify-center mb-4">
              <div
                class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <Calendar :size="32" class="text-gray-400" />
              </div>
            </div>
            <p class="text-gray-600 text-center">
              You haven't submitted any epigrams yet.
            </p>
          </div>

          <!-- Button at bottom right -->
          <div class="p-6 border-t border-gray-200">
            <div class="flex justify-end">
              <BaseButton @click="uiStore.openSubmissionPanel()">
                Submit Your First Epigram
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- Epigrams list -->
        <div v-else class="p-6">
          <div class="space-y-4">
            <div
              v-for="epigram in allEpigrams"
              :key="epigram.id"
              :class="[
                'border rounded-lg p-4 transition-shadow',
                epigramStore.currentEpigram?.id === epigram.id
                  ? 'border-accent bg-accent/5 shadow-md'
                  : 'border-gray-200 hover:shadow-md',
              ]"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1 mr-4">
                  <p class="text-gray-900 leading-relaxed mb-2">
                    {{ epigram.text }}
                  </p>
                  <p v-if="epigram.author" class="text-gray-600 text-sm">
                    — {{ epigram.author }}
                  </p>
                  <p class="text-xs text-gray-500 mt-2">
                    Last updated: {{ formatDate(epigram.updated_at) }}
                  </p>
                </div>

                <div class="flex gap-1 flex-shrink-0">
                  <button
                    @click="displayEpigram(epigram)"
                    :class="[
                      'p-2 rounded-full transition-colors',
                      epigramStore.currentEpigram?.id === epigram.id
                        ? 'text-accent bg-accent/10 cursor-not-allowed'
                        : 'text-gray-500 hover:text-green-600 hover:bg-green-50',
                    ]"
                    :disabled="
                      isDeleting ||
                      epigramStore.currentEpigram?.id === epigram.id
                    "
                    :title="
                      epigramStore.currentEpigram?.id === epigram.id
                        ? 'Currently displayed'
                        : 'Display this epigram'
                    "
                  >
                    <Eye :size="16" />
                  </button>
                  <button
                    @click="openEditModal(epigram)"
                    class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    :disabled="isDeleting"
                    title="Edit epigram"
                  >
                    <Edit :size="16" />
                  </button>
                  <button
                    @click="deleteEpigram(epigram)"
                    class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    :disabled="isDeleting"
                    title="Delete epigram"
                  >
                    <Trash2 :size="16" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Infinite scroll loading indicator -->
          <div
            v-if="isFetchingNextPage"
            class="flex justify-center items-center py-4"
          >
            <AppSpinner size="sm" class="mr-2" />
            <span class="text-sm text-gray-600">Loading more epigrams...</span>
          </div>

          <!-- Load more button (fallback for manual loading) -->
          <div v-else-if="hasNextPage" class="flex justify-center py-4">
            <BaseButton variant="secondary" @click="loadMore" class="text-sm">
              Load More
            </BaseButton>
          </div>

          <!-- End of list indicator -->
          <div v-else-if="allEpigrams.length > 0" class="text-center py-4">
            <span class="text-sm text-gray-500"
              >You've reached the end of your epigrams</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Epigram Modal -->
    <EpigramFormPanel
      :epigram="editingEpigram"
      :is-open="isEditModalOpen"
      mode="edit"
      @close="closeEditModal"
      @updated="handleEpigramUpdated"
    />

    <!-- Delete Confirmation Dialog -->
    <ConfirmationDialog
      :show="showDeleteConfirmation"
      title="Delete Epigram"
      message="Are you sure you want to delete this epigram? This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      variant="danger"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<style scoped lang="postcss">
.history-panel {
  overflow: hidden;
}

.epigram-card {
  transition: all 0.2s ease;
}

.epigram-card:hover {
  transform: translateY(-1px);
}
</style>
