<script setup lang="ts">
import {
  PencilLine,
  Settings,
  LogIn,
  UserPlus,
  LogOut,
  History,
} from "lucide-vue-next";
import { useUiStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";

const uiStore = useUiStore();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const handleSignOut = async () => {
  try {
    await authStore.logout();
    notificationStore.success("Successfully signed out");
  } catch (error) {
    notificationStore.error("Failed to sign out");
  }
};
</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <div class="logo">
        <span class="logo-text">Is It?</span>
      </div>

      <div class="header-actions">
        <!-- Guest users: Show login/signup buttons -->
        <template v-if="authStore.isGuest">
          <button
            class="header-icon-button"
            aria-label="Sign in"
            @click="uiStore.showAuthPanel('login')"
          >
            <LogIn :size="20" />
          </button>

          <button
            class="header-icon-button"
            aria-label="Sign up"
            @click="uiStore.showAuthPanel('signup')"
          >
            <UserPlus :size="20" />
          </button>
        </template>

        <!-- Authenticated users: Show app actions -->
        <template v-else>
          <button
            class="header-icon-button"
            aria-label="Submit epigram"
            @click="uiStore.toggleSubmissionPanel"
          >
            <PencilLine :size="20" />
          </button>

          <button
            class="header-icon-button"
            aria-label="History"
            @click="uiStore.toggleHistoryPanel"
          >
            <History :size="20" />
          </button>

          <button
            class="header-icon-button"
            aria-label="Settings"
            @click="uiStore.toggleSettingsPanel"
          >
            <Settings :size="20" />
          </button>

          <button
            class="header-icon-button"
            aria-label="Sign out"
            @click="handleSignOut"
            :disabled="authStore.isLoading"
          >
            <LogOut :size="20" />
          </button>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: linear-gradient(135deg, var(--grey-300) 0%, #a8b8ca 100%);
  padding: var(--spacing-sm) 0;
  box-shadow: 0 2px 8px var(--black-shadow-08);
  border-bottom: 1px solid var(--white-overlay-20);
  width: 100%;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--spacing-md);
  width: 100%;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-text {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
  color: var(--dark-800);
  text-shadow: 0 1px 2px var(--white-text-shadow);
  letter-spacing: -0.02em;
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.header-icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dark-700);
  background: var(--white-overlay-20);
  border: none;
  outline: none;
  border-radius: var(--radius-full);
  width: 40px;
  height: 40px;
  transition: all var(--transition-fast);
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 4px var(--black-shadow-10);
}

.header-icon-button:hover {
  background: var(--white-overlay-35);
  color: var(--dark-800);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--black-shadow-15);
}

.header-icon-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px var(--black-shadow-10);
}

.header-icon-button:focus {
  outline: none;
  background: var(--white-overlay-35);
  box-shadow: 0 0 0 2px var(--white-overlay-40);
}

/* Remove any potential focus rings from SVG icons */
.header-icon-button svg {
  outline: none;
  border: none;
}

.header-icon-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.header-icon-button:disabled:hover {
  background: var(--white-overlay-20);
  transform: none;
  box-shadow: 0 2px 4px var(--black-shadow-10);
}
</style>
