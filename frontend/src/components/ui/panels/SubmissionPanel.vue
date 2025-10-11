<script setup lang="ts">
import { ref, reactive, watch, computed, nextTick } from "vue";
import { X, Send } from "lucide-vue-next";
import { useUiStore } from "@/stores/ui";
import { useEpigramStore } from "@/stores/epigram";
import { useNotificationStore } from "@/stores/notification";
import { autoReloadService } from "@/services/auto-reload";
import { type EpigramSubmissionData } from "@/schemas/epigram";
import { EpigramStatus } from "@/types/epigram";
import FormTextarea from "@/components/ui/form/FormTextarea.vue";
import FormInput from "@/components/ui/form/FormInput.vue";
import FormButton from "@/components/ui/form/FormButton.vue";
import ExitConfirmation from "@/components/ui/panels/ExitConfirmation.vue";

const uiStore = useUiStore();
const epigramStore = useEpigramStore();
const notificationStore = useNotificationStore();

const form = reactive<EpigramSubmissionData>({
  text: "",
  author: "",
});

const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);
const showExitConfirmation = ref(false);

// Form validation logic
const isFormValid = computed(() => {
  const textValid =
    form.text && form.text.trim().length >= 3 && form.text.length <= 150;
  const authorValid = !form.author || form.author.length <= 50;
  return textValid && authorValid;
});

const hasUnsavedChanges = computed(() => {
  return (
    !!(form.text && form.text.trim()) || !!(form.author && form.author.trim())
  );
});

const submitEpigram = async () => {
  if (!isFormValid.value) {
    notificationStore.error(
      "Validation Error",
      "Please enter 3-150 characters for your epigram.",
      3000
    );
    return;
  }

  isSubmitting.value = true;

  try {
    // Submit to backend first - don't change display until we know it succeeded
    console.log("Submitting epigram to backend...");
    const realEpigram = await epigramStore.submitEpigram(form);

    // Only if submission succeeds: show the epigram and start timer
    console.log(
      "Submission successful - displaying epigram and starting timer"
    );
    epigramStore.setCurrentEpigram(realEpigram);
    autoReloadService.startFullTimer();

    notificationStore.success(
      "Epigram submitted!",
      "Your epigram has been submitted. Thank you for contributing!",
      3000
    );

    // Clear form and close panel
    form.text = "";
    form.author = "";
    errors.value = {};
    uiStore.closeAllPanels();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to submit epigram";
    notificationStore.error("Submission failed", errorMessage, 3000);

    // On failure: do nothing - keep current epigram and timer as they were
    console.log(
      "Submission failed - keeping current epigram and timer unchanged"
    );
  } finally {
    isSubmitting.value = false;
  }
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
          <FormTextarea
            v-model="form.text"
            label="Epigram Text"
            placeholder="Enter your epigram here (at least 3 characters)"
            :required="true"
            :error="errors.text"
            :maxlength="150"
            :rows="3"
            :show-char-count="true"
          />

          <FormInput
            v-model="form.author"
            label="Author"
            placeholder="Author name"
            :required="false"
            :error="errors.author"
            :maxlength="50"
            :show-char-count="true"
          />

          <div class="flex gap-3 justify-end mt-6">
            <FormButton variant="secondary" @click="handleCloseAttempt">
              Cancel
            </FormButton>

            <FormButton
              type="submit"
              variant="primary"
              :disabled="!isFormValid || isSubmitting"
            >
              <div class="flex items-center gap-2">
                <Send :size="16" />
                <span>{{ isSubmitting ? "Submitting..." : "Submit" }}</span>
              </div>
            </FormButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.submission-panel {
  /* Ensure no horizontal overflow */
  overflow-x: hidden;
  box-sizing: border-box;
}

/* Ensure form elements don't cause horizontal overflow */
.submission-panel form {
  overflow-x: hidden;
  box-sizing: border-box;
}

.submission-panel textarea,
.submission-panel input {
  overflow-x: hidden;
  box-sizing: border-box;
  max-width: 100%;
}
</style>
