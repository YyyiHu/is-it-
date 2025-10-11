<script setup lang="ts">
import { PencilLine, Settings } from "lucide-vue-next";
import { useUiStore } from "@/stores/ui";

const uiStore = useUiStore();
</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <div class="logo">
        <span class="logo-text">Is It?</span>
      </div>

      <div class="header-actions">
        <button
          class="header-icon-button"
          aria-label="Submit epigram"
          @click="uiStore.toggleSubmissionPanel"
        >
          <PencilLine :size="20" />
        </button>

        <button
          class="header-icon-button"
          aria-label="Settings"
          @click="uiStore.toggleSettingsPanel"
        >
          <Settings :size="20" />
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: linear-gradient(135deg, var(--grey-300) 0%, #a8b8ca 100%);
  padding: var(--spacing-sm) 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
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
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
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
  background: rgba(255, 255, 255, 0.2);
  border: none;
  outline: none;
  border-radius: var(--radius-full);
  width: 40px;
  height: 40px;
  transition: all var(--transition-fast);
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-icon-button:hover {
  background: rgba(255, 255, 255, 0.35);
  color: var(--dark-800);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.header-icon-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-icon-button:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.35);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
}

/* Remove any potential focus rings from SVG icons */
.header-icon-button svg {
  outline: none;
  border: none;
}
</style>
