<script setup lang="ts">
import { X, Settings } from "lucide-vue-next";
import { reactive, ref, computed, watch } from "vue";
import { useUiStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import { useUserSettings } from "@/composables/useUserSettings";
import { BaseButton } from "@/components/shared/forms";
import { ConfirmationDialog } from "@/components/shared/ui";

const uiStore = useUiStore();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const { settings, isLoading, isUpdating, updateSettings } = useUserSettings();

const form = reactive({
  autoReload: false,
  hours: 0,
  minutes: 5,
});

const hasChanges = ref(false);
const originalForm = reactive({ ...form });
const showExitConfirmation = ref(false);

const isValidInterval = computed(() => {
  const hours = form.hours;
  const minutes = form.minutes;
  return hours >= 0 && hours <= 4 && minutes >= 1 && minutes <= 60;
});

const totalMinutes = computed(() => form.hours * 60 + form.minutes);

// Watch for changes in form
watch(
  () => ({ ...form }),
  (newForm) => {
    hasChanges.value =
      newForm.autoReload !== originalForm.autoReload ||
      newForm.hours !== originalForm.hours ||
      newForm.minutes !== originalForm.minutes;
  },
  { deep: true }
);

// Watch for settings from query and update form (only for authenticated users)
watch(
  () => settings.value,
  (newSettings) => {
    if (newSettings && authStore.isAuthenticated) {
      const totalMins = newSettings.auto_reload_interval_minutes;

      form.autoReload = newSettings.auto_reload_enabled;
      form.hours = Math.floor(totalMins / 60);
      form.minutes = totalMins % 60;

      // Update original form to track changes
      Object.assign(originalForm, form);
      hasChanges.value = false;
    }
  },
  { immediate: true }
);

const saveSettings = () => {
  if (!authStore.isAuthenticated) {
    return; // Shouldn't happen, but safety check
  }

  if (!isValidInterval.value) return;

  const settingsUpdate = {
    auto_reload_enabled: form.autoReload,
    auto_reload_interval_minutes: totalMinutes.value,
  };

  // Update original form to prevent unsaved changes warning
  Object.assign(originalForm, form);
  hasChanges.value = false;

  // Call the update function - this will also update the auto-reload service
  updateSettings(settingsUpdate);

  // Wait for settings to be applied before closing panel
  setTimeout(() => {
    // Close panel
    uiStore.closeAllPanels();

    // Show notification after panel closes
    setTimeout(() => {
      notificationStore.success("Settings saved successfully");
    }, 300);
  }, 100);
};

const closePanel = () => {
  // Reset form to original values
  Object.assign(form, originalForm);
  hasChanges.value = false;
  showExitConfirmation.value = false;
  uiStore.closeAllPanels();
};

const handleClose = () => {
  if (hasChanges.value) {
    showExitConfirmation.value = true;
  } else {
    closePanel();
  }
};

const cancelExit = () => {
  showExitConfirmation.value = false;
};

// Validation functions
const validateMinutes = () => {
  if (form.minutes > 59) form.minutes = 59;
  if (form.minutes < 0) form.minutes = 0;
};

const validateHours = () => {
  if (form.hours > 4) form.hours = 4;
  if (form.hours < 0) form.hours = 0;
};
</script>

<template>
  <div
    v-if="uiStore.isSettingsPanelOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1200] p-4"
    @click="handleClose"
  >
    <div
      class="settings-panel bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative"
      @click.stop
    >
      <!-- Exit confirmation overlay -->
      <ConfirmationDialog
        :show="showExitConfirmation"
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to close without saving?"
        confirm-text="Leave"
        cancel-text="Stay"
        variant="warning"
        @confirm="closePanel"
        @cancel="cancelExit"
      />

      <!-- Header -->
      <div
        class="flex items-center justify-between p-6 border-b border-gray-200"
      >
        <h2 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Settings :size="24" />
          Settings
        </h2>
        <button
          @click="handleClose"
          class="p-2 hover:bg-gray-100 rounded-full transition-colors"
          :disabled="isUpdating"
        >
          <X :size="20" class="text-gray-500" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Guest message -->
        <div v-if="!authStore.isAuthenticated" class="text-center py-8">
          <div class="mb-4">
            <div
              class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <X :size="32" class="text-gray-400" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              Sign In Required
            </h3>
            <p class="text-gray-500 mb-6">
              Settings are only available for signed-in users. Please sign in to
              customize your auto-reload preferences.
            </p>
            <BaseButton
              variant="primary"
              @click="
                () => {
                  uiStore.closeAllPanels();
                  uiStore.showAuthPanel('login');
                }
              "
            >
              Sign In
            </BaseButton>
          </div>
        </div>

        <!-- Loading state -->
        <div v-else-if="isLoading" class="text-center py-4">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"
          ></div>
          <p class="text-gray-500 mt-2">Loading settings...</p>
        </div>

        <!-- Settings form (authenticated users only) -->
        <div v-else>
          <!-- Auto-reload toggle -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700"
                  >Auto-reload</label
                >
                <p class="text-xs text-gray-500">
                  Automatically show new epigrams
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="form.autoReload"
                  class="sr-only peer"
                  :disabled="isUpdating"
                />
                <div
                  class="w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                  :style="{
                    backgroundColor: form.autoReload
                      ? 'var(--dark-700)'
                      : '#e5e7eb',
                  }"
                ></div>
              </label>
            </div>

            <!-- Interval settings -->
            <div
              v-if="form.autoReload"
              class="space-y-4 pl-4 border-l-2 border-blue-100"
            >
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Reload Interval
                </label>

                <!-- Hours input -->
                <div class="flex items-center space-x-4 mb-3">
                  <div class="flex-1">
                    <label class="block text-xs text-gray-500 mb-1"
                      >Hours</label
                    >
                    <input
                      type="number"
                      v-model.number="form.hours"
                      @blur="validateHours"
                      min="0"
                      max="4"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      :disabled="isUpdating"
                    />
                  </div>
                  <div class="flex-1">
                    <label class="block text-xs text-gray-500 mb-1"
                      >Minutes</label
                    >
                    <input
                      type="number"
                      v-model.number="form.minutes"
                      @blur="validateMinutes"
                      min="1"
                      max="59"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      :disabled="isUpdating"
                    />
                  </div>
                </div>

                <!-- Validation message -->
                <p v-if="!isValidInterval" class="text-xs text-red-600">
                  Please enter a valid interval (1-240 minutes total, max 4
                  hours)
                </p>
                <p v-else class="text-xs text-gray-500">
                  Total: {{ totalMinutes }} minute{{
                    totalMinutes !== 1 ? "s" : ""
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer (authenticated users only) -->
      <div
        v-if="authStore.isAuthenticated"
        class="flex justify-end gap-3 p-6 border-t border-gray-200"
      >
        <BaseButton
          variant="secondary"
          @click="handleClose"
          :disabled="isUpdating"
        >
          Cancel
        </BaseButton>
        <BaseButton
          variant="primary"
          @click="saveSettings"
          :disabled="!hasChanges || !isValidInterval || isUpdating"
          :loading="isUpdating"
        >
          Save Changes
        </BaseButton>
      </div>
    </div>
  </div>
</template>
