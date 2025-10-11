<script setup lang="ts">
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import HomeView from "@/views/HomeView.vue";
import SubmissionPanel from "@/components/ui/panels/SubmissionPanel.vue";
import SettingsPanel from "@/components/ui/panels/SettingsPanel.vue";
import ToastManager from "@/components/ui/notifications/ToastManager.vue";
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
