import { computed, watch, ref, type ComputedRef } from "vue";
import { useQuery, useMutation } from "@tanstack/vue-query";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import {
  userSettingsService,
  autoReloadService,
  type UserSettings,
  type UserSettingsUpdate,
} from "@/services";
import { queryClient } from "@/lib/query-client";

export function useUserSettings(): {
  settings: ComputedRef<UserSettings | null>;
  isLoading: ComputedRef<boolean>;
  isUpdating: ComputedRef<boolean>;
  isError: ComputedRef<boolean>;
  error: ComputedRef<Error | null>;
  updateSettings: (settings: UserSettingsUpdate) => void;
  refetch: () => void;
} {
  const authStore = useAuthStore();
  const notificationStore = useNotificationStore();

  // Query for fetching user settings (only for authenticated users)
  const settingsQuery = useQuery({
    queryKey: ["userSettings", computed(() => authStore.user?.id)],
    queryFn: async (): Promise<UserSettings | null> => {
      if (!authStore.isAuthenticated) {
        return null;
      }
      return userSettingsService.getUserSettings();
    },
    enabled: computed(() => authStore.isAuthenticated),
    staleTime: 30 * 1000, // 30 seconds - settings can change on other devices
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    refetchOnWindowFocus: true, // Refetch when user switches back to the app
    refetchInterval: 60 * 1000, // Auto-refetch every 60 seconds when focused
  });

  // Mutation for updating user settings (only for authenticated users)
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: UserSettingsUpdate): Promise<UserSettings> => {
      if (!authStore.isAuthenticated) {
        throw new Error("Must be authenticated to update settings");
      }
      return userSettingsService.updateUserSettings(settings);
    },
    onSuccess: (updatedSettings) => {
      // Update the query cache
      queryClient.setQueryData(
        ["userSettings", authStore.user?.id],
        updatedSettings
      );

      // Update the auto-reload service
      autoReloadService.updateSettings({
        enabled: updatedSettings.auto_reload_enabled,
        interval: updatedSettings.auto_reload_interval_minutes,
      });

      // Success notification is now handled by the component
    },
    onError: (error) => {
      // Error notification is shown to user
      notificationStore.error("Failed to save settings");
    },
  });

  // Watch for settings changes and initialize timer
  watch(
    () => settingsQuery.data.value,
    (newSettings) => {
      if (newSettings && authStore.isAuthenticated) {
        // Stop any existing timer and start fresh with user settings
        autoReloadService.stop();
        autoReloadService.updateSettings({
          enabled: newSettings.auto_reload_enabled,
          interval: newSettings.auto_reload_interval_minutes,
        });
      }
    },
    { immediate: false }
  );

  // Watch for authentication changes
  watch(
    () => authStore.isAuthenticated,
    (isAuthenticated, wasAuthenticated) => {
      if (!isAuthenticated) {
        // Stop timer on logout
        autoReloadService.stop();
      } else if (isAuthenticated && !wasAuthenticated) {
        // Refetch settings on login
        settingsQuery.refetch();
      }
    }
  );

  return {
    // Data
    settings: computed(() => settingsQuery.data.value ?? null),

    // Loading states
    isLoading: computed(() => settingsQuery.isLoading.value),
    isUpdating: computed(() => updateSettingsMutation.isPending.value),

    // Error states
    isError: computed(() => settingsQuery.isError.value),
    error: computed(() => settingsQuery.error.value),

    // Actions
    updateSettings: updateSettingsMutation.mutate,
    refetch: settingsQuery.refetch,
  };
}
