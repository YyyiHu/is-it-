import { defineStore } from 'pinia';
import type { UiState } from '@/types/ui';

export const useUiStore = defineStore('ui', {
  state: (): UiState => ({
    activePanel: null,
    isSubmissionPanelOpen: false,
    isSettingsPanelOpen: false,
  }),

  actions: {
    openSubmissionPanel() {
      this.closeAllPanels();
      this.activePanel = 'submission';
      this.isSubmissionPanelOpen = true;
    },

    openSettingsPanel() {
      this.closeAllPanels();
      this.activePanel = 'settings';
      this.isSettingsPanelOpen = true;
    },

    closeAllPanels() {
      this.activePanel = null;
      this.isSubmissionPanelOpen = false;
      this.isSettingsPanelOpen = false;
    },

    toggleSubmissionPanel() {
      if (this.isSubmissionPanelOpen) {
        this.closeAllPanels();
      } else {
        this.openSubmissionPanel();
      }
    },

    toggleSettingsPanel() {
      if (this.isSettingsPanelOpen) {
        this.closeAllPanels();
      } else {
        this.openSettingsPanel();
      }
    },
  },

  getters: {
    hasOpenPanel: (state) => state.activePanel !== null,
  },
});

