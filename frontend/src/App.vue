<script setup lang="ts">
import { onMounted } from "vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import HomeView from "@/views/HomeView.vue";
import SubmissionPanel from "@/components/features/epigram/SubmissionPanel.vue";
import SettingsPanel from "@/components/features/settings/SettingsPanel.vue";
import AuthPanel from "@/components/features/auth/AuthPanel.vue";
import ToastManager from "@/components/features/notifications/ToastManager.vue";
import { useUiStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import { useUserSettings } from "@/composables/useUserSettings";

const uiStore = useUiStore();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

// Initialize user settings composable globally to handle timer initialization on login
useUserSettings();

// Initialize authentication on app startup
onMounted(async () => {
  await authStore.initializeAuth();
});

const handleAuthSuccess = (type: "login" | "signup") => {
  // Close the auth panel
  uiStore.hideAuthPanel();

  // Show appropriate notification
  if (type === "login") {
    notificationStore.success("Successfully signed in");
  } else {
    notificationStore.success("Account created successfully");
  }
};

// Clear auth errors when opening the auth panel
const handleAuthPanelOpen = () => {
  authStore.clearError();
};
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white">
    <AppHeader class="flex-shrink-0" />

    <main class="flex-1 flex flex-col overflow-hidden">
      <HomeView />
    </main>

    <AppFooter class="flex-shrink-0" />

    <!-- Panels with proper z-index layering -->
    <SubmissionPanel />
    <SettingsPanel />

    <!-- Auth Panel -->
    <AuthPanel
      v-if="uiStore.isAuthPanelOpen"
      :initial-mode="uiStore.authPanelMode"
      @close="uiStore.hideAuthPanel"
      @success="handleAuthSuccess"
      @open="handleAuthPanelOpen"
    />

    <!-- Toast notifications with highest z-index -->
    <ToastManager />
  </div>
</template>

<style>
/* Ensure no horizontal scrollbars */
html,
body {
  overflow-x: hidden;
}

body {
  margin: 0;
  padding: 0;
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  line-height: 1.5;
  color: #07151d;
  background-color: #ffffff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

/* Fix for potential scrollbar issues */
.min-h-screen {
  min-height: 100vh;
  min-height: 100dvh; /* Use dynamic viewport height if supported */
}
</style>
