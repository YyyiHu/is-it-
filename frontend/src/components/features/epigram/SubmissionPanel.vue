<script setup lang="ts">
import { ref, reactive, watch, computed, nextTick } from "vue";
import { X, Send } from "lucide-vue-next";
import { useUiStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import { useEpigrams } from "@/composables/useEpigrams";
import { useNotificationStore } from "@/stores/notification";
import { type EpigramCreate } from "@/types/epigram";
import { BaseInput, BaseButton, BaseTextarea } from "@/components/shared/forms";
import { validateEpigramSubmission } from "@/schemas/epigram";
import ExitConfirmation from "@/components/shared/ui/ExitConfirmation.vue";

const uiStore = useUiStore();
const authStore = useAuthStore();
const { submitEpigram: submitEpigramMutation, isSubmitting } = useEpigrams();
const notificationStore = useNotificationStore();

const form = reactive<EpigramCreate>({
  text: "",
  author: "",
});

const errors = ref<Record<string, string>>({});
const showExitConfirmation = ref(false);

// Form validation logic
const isFormValid = computed(() => {
  const result = validateEpigramSubmission(form);
  return result.success;
});

const hasUnsavedChanges = computed(() => {
  return (
    !!(form.text && form.text.trim()) || !!(form.author && form.author.trim())
  );
});

const submitEpigram = async () => {
  // Check authentication first
  if (!authStore.isAuthenticated) {
    notificationStore.error(
      "Authentication required",
      "Please sign in to submit epigrams."
    );
    uiStore.closeAllPanels();
    uiStore.showAuthPanel("login");
    return;
  }

  if (!isFormValid.value) {
    notificationStore.error(
      "Validation Error",
      "Please enter 3-150 characters for your epigram."
    );
    return;
  }

  // Submit using the composable
  submitEpigramMutation({
    text: form.text,
    author: form.author || undefined, // Convert empty string to undefined
  });

  // Clear form data immediately
  form.text = "";
  form.author = "";
  errors.value = {};

  // Close panel
  uiStore.closeAllPanels();

  // Show success notification after panel closes
  setTimeout(() => {
    notificationStore.success("Epigram submitted successfully");
  }, 300);
};

const handleCloseAttempt = () => {
  if (hasUnsavedChanges.value) {
    showExitConfirmation.value = true;
  } else {
    closePanel();
  }
};

const closePanel = () => {
  form.text = "";
  form.author = "";
  errors.value = {};
  showExitConfirmation.value = false;
  uiStore.closeAllPanels();
};

const cancelExit = () => {
  showExitConfirmation.value = false;
};

// Auto-focus textarea when panel opens
watch(
  () => uiStore.isSubmissionPanelOpen,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        const textarea = document.querySelector(".submission-panel textarea");
        if (textarea) {
          (textarea as HTMLElement).focus();
        }
      });
    }
  }
);

// Clear errors when user starts typing
watch(
  () => form.text,
  () => {
    if (errors.value.text) {
      errors.value.text = "";
    }
  }
);

watch(
  () => form.author,
  () => {
    if (errors.value.author) {
      errors.value.author = "";
    }
  }
);
</script>

<template>
  <div
    v-if="uiStore.isSubmissionPanelOpen"
    class="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-[1000] overflow-x-hidden"
    @mousedown.self="handleCloseAttempt"
  >
    <div
      class="submission-panel w-full max-w-lg max-h-[90vh] bg-white rounded-lg shadow-xl relative overflow-x-hidden"
      @click.stop
    >
      <!-- Exit confirmation overlay -->
      <ExitConfirmation
        :show="showExitConfirmation"
        title="Unsaved changes"
        message="You have unsaved changes. Are you sure you want to leave?"
        @confirm="closePanel"
        @cancel="cancelExit"
      />

      <div
        class="flex justify-between items-center p-6 border-b border-gray-200"
      >
        <h3 class="text-xl font-semibold text-gray-900 m-0">
          Submit an Epigram
        </h3>
        <button
          class="flex items-center justify-center text-gray-400 bg-transparent border-0 outline-none rounded-full w-8 h-8 transition-colors hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
          @click="handleCloseAttempt"
          aria-label="Close panel"
        >
          <X :size="20" />
        </button>
      </div>

      <div class="overflow-y-auto max-h-[calc(90vh-140px)] overflow-x-hidden">
        <form @submit.prevent="submitEpigram" class="p-6">
          <BaseTextarea
            v-model="form.text"
            label="Epigram Text"
            placeholder="Enter your epigram here (at least 3 characters)"
            :required="true"
            :error="errors.text"
            :maxlength="150"
            :rows="3"
            :show-char-count="true"
          />

          <BaseInput
            v-model="form.author"
            label="Author"
            placeholder="Author name"
            :required="false"
            :error="errors.author"
            :maxlength="50"
            :show-char-count="true"
          />

          <div class="flex gap-3 justify-end mt-6">
            <BaseButton variant="secondary" @click="handleCloseAttempt">
              Cancel
            </BaseButton>

            <BaseButton
              type="submit"
              variant="primary"
              :disabled="!isFormValid || isSubmitting"
              :loading="isSubmitting"
            >
              <Send :size="16" />
              Submit
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.submission-panel {
  overflow-x: hidden;
}
</style>
