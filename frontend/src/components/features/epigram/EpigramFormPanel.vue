<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted, onUnmounted } from "vue";
import { X, Send, Save, PenTool } from "lucide-vue-next";
import { useMutation } from "@tanstack/vue-query";
import { useUiStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import { useEpigramStore } from "@/stores/epigram";
import { useEpigrams } from "@/composables/useEpigrams";
import { epigramService } from "@/services";
import { type EpigramRead, type EpigramCreate } from "@/types/epigram";
import { BaseInput, BaseButton, BaseTextarea } from "@/components/shared/forms";
import { ConfirmationDialog } from "@/components/shared/ui";
import { validateEpigramSubmission } from "@/schemas/epigram";
import { queryClient } from "@/lib/query-client";

interface Props {
  // For edit mode
  epigram?: EpigramRead | null;
  isOpen?: boolean;
  // Mode: 'create' or 'edit'
  mode?: 'create' | 'edit';
}

interface Emits {
  (e: "close"): void;
  (e: "updated", epigram: EpigramRead): void;
  (e: "created", epigram: EpigramRead): void;
}

const props = withDefaults(defineProps<Props>(), {
  epigram: null,
  isOpen: false,
  mode: 'create'
});

const emit = defineEmits<Emits>();

const uiStore = useUiStore();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const epigramStore = useEpigramStore();

// Use submission composable for create mode
const { submitEpigram: submitEpigramMutation, isSubmitting } = useEpigrams();

// Form state
const form = reactive<EpigramCreate>({
  text: "",
  author: "",
});

const errors = ref<Record<string, string[]>>({});
const showExitConfirmation = ref(false);

// For edit mode, track initial state
const initialFormState = ref<EpigramCreate>({ text: "", author: "" });

// Update mutation for edit mode
const updateMutation = useMutation({
  mutationFn: async (data: { id: number; text: string; author?: string }) => {
    return epigramService.updateEpigram(data.id, { text: data.text, author: data.author });
  },
  onSuccess: (updatedEpigram) => {
    // Update the current epigram in the store if it's being displayed
    epigramStore.updateCurrentEpigram(updatedEpigram);
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["userEpigrams"] });
    
    notificationStore.success("Epigram updated successfully");
    emit("updated", updatedEpigram);
    emit("close");
  },
  onError: (error: any) => {
    if (error.message?.includes("already exists")) {
      notificationStore.error("This epigram already exists");
    } else {
      notificationStore.error("Failed to update epigram");
    }
  },
});

// Computed properties
const isEditMode = computed(() => props.mode === 'edit');
const isCreateMode = computed(() => props.mode === 'create');

const panelTitle = computed(() => 
  isEditMode.value ? "Edit Epigram" : "Submit an Epigram"
);

const submitButtonText = computed(() => 
  isEditMode.value ? "Save Changes" : "Submit Epigram"
);

const submitIcon = computed(() => 
  isEditMode.value ? Save : Send
);

const titleIcon = computed(() => 
  isEditMode.value ? Save : PenTool
);

const isVisible = computed(() => 
  isCreateMode.value ? uiStore.isSubmissionPanelOpen : props.isOpen
);

const hasChanges = computed(() => {
  if (isCreateMode.value) {
    return form.text.trim() !== "" || (form.author || "").trim() !== "";
  } else {
    return form.text !== initialFormState.value.text || form.author !== initialFormState.value.author;
  }
});

const isFormValid = computed(() => {
  const result = validateEpigramSubmission(form);
  if (!result.success) {
    errors.value = result.error.flatten().fieldErrors;
  } else {
    errors.value = {};
  }
  return result.success;
});

const canSubmit = computed(() => {
  if (isCreateMode.value) {
    return isFormValid.value && !isSubmitting.value;
  } else {
    return isFormValid.value && hasChanges.value && !updateMutation.isPending.value;
  }
});

const isLoading = computed(() => 
  isCreateMode.value ? isSubmitting.value : updateMutation.isPending.value
);

// Methods
const handleCloseAttempt = () => {
  if (hasChanges.value && !isLoading.value) {
    showExitConfirmation.value = true;
  } else {
    closePanel();
  }
};

const closePanel = () => {
  if (isCreateMode.value) {
    uiStore.closeAllPanels();
  } else {
    emit("close");
  }
  resetForm();
};

const cancelExit = () => {
  showExitConfirmation.value = false;
};

const confirmExit = () => {
  showExitConfirmation.value = false;
  closePanel();
};

const resetForm = () => {
  form.text = "";
  form.author = "";
  errors.value = {};
  showExitConfirmation.value = false;
};

const handleSubmit = async () => {
  if (!canSubmit.value) return;

  if (isCreateMode.value) {
    // Create mode
    try {
      await submitEpigramMutation({
        text: form.text.trim(),
        author: (form.author || "").trim() || undefined,
      });
      
      // Success handling is done in the mutation, just close the panel
      closePanel();
    } catch (error) {
      // Error handling is done in the mutation
    }
  } else {
    // Edit mode
    if (!props.epigram) return;
    
    updateMutation.mutate({
      id: props.epigram.id,
      text: form.text.trim(),
      author: (form.author || "").trim() || undefined,
    });
  }
};

// Watch for epigram changes in edit mode
watch(
  () => props.epigram,
  (newEpigram) => {
    if (newEpigram && isEditMode.value) {
      form.text = newEpigram.text;
      form.author = newEpigram.author || "";
      initialFormState.value = { ...form };
      errors.value = {};
    }
  },
  { immediate: true }
);

// Watch for panel visibility changes
watch(
  () => isVisible.value,
  (visible) => {
    if (visible && isCreateMode.value) {
      resetForm();
    }
  }
);

// Handle escape key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    handleCloseAttempt();
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-[1000]"
    @mousedown.self="handleCloseAttempt"
  >
    <div
      class="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden"
      :class="isEditMode ? 'max-w-2xl' : 'max-w-lg max-h-[90vh]'"
      @click.stop
    >
      <!-- Exit confirmation overlay -->
      <ConfirmationDialog
        :show="showExitConfirmation"
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave without saving?"
        confirm-text="Leave"
        cancel-text="Stay"
        variant="warning"
        @confirm="confirmExit"
        @cancel="cancelExit"
      />

      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b border-gray-200">
        <h3 class="text-xl font-semibold text-gray-900 m-0 flex items-center gap-2">
          <component :is="titleIcon" :size="24" />
          {{ panelTitle }}
        </h3>
        <button
          class="flex items-center justify-center text-gray-400 bg-transparent border-0 outline-none rounded-full w-8 h-8 transition-colors hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
          @click="handleCloseAttempt"
          aria-label="Close panel"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- Content -->
      <div class="overflow-y-auto" :class="isEditMode ? 'max-h-[calc(90vh-140px)]' : ''">
        <form @submit.prevent="handleSubmit" class="p-6">
          <!-- Epigram Text -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Epigram Text *
            </label>
            <BaseTextarea
              v-model="form.text"
              placeholder="Enter your epigram..."
              :maxlength="150"
              :rows="4"
              :error="errors.text?.[0]"
              required
            />
            <div class="flex justify-between items-center mt-2">
              <div class="text-xs text-gray-500">
                Maximum 150 characters
              </div>
              <div class="text-xs text-gray-500">
                {{ form.text.length }}/150
              </div>
            </div>
          </div>

          <!-- Author -->
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Author (optional)
            </label>
            <BaseInput
              v-model="form.author"
              placeholder="Author name (optional)"
              :maxlength="50"
              :error="errors.author?.[0]"
            />
            <div class="text-xs text-gray-500 mt-1">
              Maximum 50 characters
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 justify-end pt-4 border-t border-gray-200 mt-6">
            <BaseButton
              type="button"
              variant="secondary"
              @click="handleCloseAttempt"
              :disabled="isLoading"
            >
              Cancel
            </BaseButton>
            <BaseButton
              type="submit"
              :disabled="!canSubmit"
              :loading="isLoading"
            >
              <component :is="submitIcon" :size="16" class="mr-2" />
              {{ submitButtonText }}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
/* Ensure proper scrolling for edit mode */
.overflow-y-auto {
  overflow-x: hidden;
}
</style>
