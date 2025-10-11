<script setup lang="ts">
import { X } from "lucide-vue-next";
import { reactive, ref, computed, watch } from "vue";
import { useUiStore } from "@/stores/ui";
import { useNotificationStore } from "@/stores/notification";
import { autoReloadService } from "@/services/auto-reload";
import FormButton from "@/components/ui/form/FormButton.vue";
import ExitConfirmation from "@/components/ui/panels/ExitConfirmation.vue";

const uiStore = useUiStore();
const notificationStore = useNotificationStore();

const settings = reactive({
  autoReload: false,
  hours: 0,
  minutes: 5,
});

const hasChanges = ref(false);
const originalSettings = reactive({ ...settings });
const showExitConfirmation = ref(false);

const isValidInterval = computed(() => {
  const hours = settings.hours;
  const minutes = settings.minutes;

  // Validate hours and minutes
  const isHoursValid = Number.isInteger(hours) && hours >= 0 && hours <= 4;
  const isMinutesValid =
    Number.isInteger(minutes) && minutes >= 0 && minutes <= 59;

  // Ensure total time is valid
  const totalMinutes = hours * 60 + minutes;
  return (
    isHoursValid && isMinutesValid && totalMinutes >= 1 && totalMinutes <= 240
  );
});

// Force minutes to stay within 0-59 range
const validateMinutes = () => {
  if (settings.minutes > 59) {
    settings.minutes = 59;
  }
  if (settings.minutes < 0) {
    settings.minutes = 0;
  }
};

// Force hours to stay within 0-4 range
const validateHours = () => {
  if (settings.hours > 4) {
    settings.hours = 4;
  }
  if (settings.hours < 0) {
    settings.hours = 0;
  }
};

const totalIntervalInMinutes = computed(() => {
  return settings.hours * 60 + settings.minutes;
});

// Watch for changes
watch(
  settings,
  () => {
    hasChanges.value =
      JSON.stringify(settings) !== JSON.stringify(originalSettings);
  },
  { deep: true }
);

const handleCloseAttempt = () => {
  if (hasChanges.value) {
    showExitConfirmation.value = true;
  } else {
    closePanel();
  }
};

const closePanel = () => {
  Object.assign(settings, originalSettings);
  hasChanges.value = false;
  showExitConfirmation.value = false;
  uiStore.closeAllPanels();
};

const cancelExit = () => {
  showExitConfirmation.value = false;
};

const saveSettings = () => {
  if (!isValidInterval.value) {
    if (settings.minutes > 59) {
      notificationStore.error(
        "Invalid minutes",
        "Minutes must be between 0 and 59",
        3000
      );
    } else {
      notificationStore.error(
        "Invalid time setting",
        "Please enter a valid time between 1 and 240 minutes total",
        3000
      );
    }
    return;
  }

  try {
    localStorage.setItem("appSettings", JSON.stringify(settings));
    Object.assign(originalSettings, settings);
    hasChanges.value = false;

    // Update auto-reload service
    autoReloadService.updateSettings(
      settings.autoReload,
      totalIntervalInMinutes.value
    );

    notificationStore.success(
      "Settings saved!",
      "Your preferences have been updated successfully.",
      3000 // Explicitly set 3 seconds
    );

    uiStore.closeAllPanels();
  } catch (error) {
    notificationStore.error(
      "Failed to save settings",
      "Please try again or contact support if the problem persists.",
      3000 // Explicitly set 3 seconds
    );
  }
};

// Load settings on component mount
const loadSettings = () => {
  try {
    const saved = localStorage.getItem("appSettings");
    if (saved) {
      const parsedSettings = JSON.parse(saved);

      // Handle conversion from old format (single autoReloadInterval) to new format (hours/minutes)
      if (
        parsedSettings.autoReloadInterval !== undefined &&
        parsedSettings.hours === undefined &&
        parsedSettings.minutes === undefined
      ) {
        const totalMinutes = parsedSettings.autoReloadInterval;
        parsedSettings.hours = Math.floor(totalMinutes / 60);
        parsedSettings.minutes = totalMinutes % 60;
        delete parsedSettings.autoReloadInterval;
      }

      Object.assign(settings, parsedSettings);
      Object.assign(originalSettings, parsedSettings);
    }
  } catch (error) {
    console.warn("Failed to load settings from localStorage");
  }
};

loadSettings();
</script>

<template>
  <div
    v-if="uiStore.isSettingsPanelOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1200] p-4"
    @click="handleCloseAttempt"
  >
    <div
      class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative"
      @click.stop
    >
      <!-- Exit confirmation overlay -->
      <ExitConfirmation
        :show="showExitConfirmation"
        title="Unsaved changes"
        message="You have unsaved settings changes. Are you sure you want to leave?"
        @confirm="closePanel"
        @cancel="cancelExit"
      />

      <div
        class="flex justify-between items-center p-6 border-b border-gray-200"
      >
        <h3 class="text-xl font-semibold text-gray-900 m-0">Settings</h3>
        <button
          class="flex items-center justify-center text-gray-400 bg-transparent border-none rounded-full w-8 h-8 transition-colors hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
          @click="handleCloseAttempt"
          aria-label="Close panel"
        >
          <X :size="20" />
        </button>
      </div>

      <div class="p-6">
        <div class="mb-8">
          <h4 class="text-lg font-semibold text-gray-900 mb-1">Auto Reload</h4>
          <p class="text-sm text-gray-600 mb-6 leading-relaxed">
            Automatically load new epigrams at regular intervals to keep content
            fresh.
          </p>

          <div class="mb-4">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                v-model="settings.autoReload"
                type="checkbox"
                class="sr-only"
              />
              <!-- Custom toggle switch using your theme colors -->
              <div
                class="relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out shadow-inner"
                :style="{
                  backgroundColor: settings.autoReload
                    ? 'var(--accent)'
                    : 'var(--grey-300)',
                }"
              >
                <div
                  class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out shadow-sm"
                  :class="{ 'translate-x-6': settings.autoReload }"
                ></div>
              </div>
              <span class="text-sm font-medium text-gray-900">
                Enable auto reload
              </span>
            </label>
          </div>

          <!-- Interval setting - only show when auto reload is enabled -->
          <div
            v-if="settings.autoReload"
            class="mt-6 pt-4 border-t border-gray-200"
          >
            <label class="block text-sm font-medium text-gray-900 mb-2">
              Reload interval
            </label>
            <div class="flex items-center gap-3 mb-1">
              <div class="flex items-center">
                <input
                  v-model.number="settings.hours"
                  type="number"
                  min="0"
                  max="4"
                  step="1"
                  @input="validateHours"
                  onkeydown="return event.keyCode !== 190"
                  class="w-16 px-3 py-2 border-2 rounded-md text-sm bg-white text-gray-900 transition-colors text-center font-medium focus:outline-none"
                  :class="
                    isValidInterval
                      ? 'border-gray-300 focus:border-accent'
                      : 'border-error-red focus:border-error-red'
                  "
                />
                <span class="text-sm font-medium text-gray-600 ml-2"
                  >hours</span
                >
              </div>

              <div class="flex items-center">
                <input
                  v-model.number="settings.minutes"
                  type="number"
                  min="0"
                  max="59"
                  step="1"
                  @input="validateMinutes"
                  onkeydown="return event.keyCode !== 190"
                  class="w-16 px-3 py-2 border-2 rounded-md text-sm bg-white text-gray-900 transition-colors text-center font-medium focus:outline-none"
                  :class="
                    isValidInterval
                      ? 'border-gray-300 focus:border-accent'
                      : 'border-error-red focus:border-error-red'
                  "
                />
                <span class="text-sm font-medium text-gray-600 ml-2"
                  >minutes</span
                >
              </div>
            </div>
            <p
              class="text-xs italic"
              :class="isValidInterval ? 'text-gray-500' : 'text-error-red'"
            >
              {{
                isValidInterval
                  ? `Total time: ${totalIntervalInMinutes.value} minutes`
                  : settings.minutes > 59
                  ? "Minutes must be between 0-59"
                  : "Please enter a valid time (1-240 minutes total)"
              }}
            </p>
          </div>
        </div>
      </div>

      <div
        class="flex justify-end items-center gap-3 px-6 pb-6 pt-4 bg-gray-50 border-t border-gray-200"
      >
        <FormButton variant="secondary" @click="handleCloseAttempt">
          Cancel
        </FormButton>

        <FormButton
          variant="primary"
          :disabled="!hasChanges || !isValidInterval"
          :disabled-reason="
            !hasChanges
              ? 'No changes to save'
              : !isValidInterval
              ? 'Please fix the interval value'
              : ''
          "
          @click="saveSettings"
        >
          Save Changes
        </FormButton>
      </div>
    </div>
  </div>
</template>
