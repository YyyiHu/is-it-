import { defineStore } from "pinia";
import type { UiState } from "@/types/ui";

export const useUiStore = defineStore("ui", {
  state: (): UiState => ({
    activePanel: null,
    isSubmissionPanelOpen: false,
    isSettingsPanelOpen: false,
    isAuthPanelOpen: false,
    authPanelMode: "login",
  }),

  actions: {
    openSubmissionPanel() {
      this.closeAllPanels();
      this.activePanel = "submission";
      this.isSubmissionPanelOpen = true;
    },

    openSettingsPanel() {
      this.closeAllPanels();
      this.activePanel = "settings";
      this.isSettingsPanelOpen = true;
    },

    openAuthPanel(mode: "login" | "signup" = "login") {
      this.closeAllPanels();
      this.activePanel = "auth";
      this.isAuthPanelOpen = true;
      this.authPanelMode = mode;
    },

    closeAllPanels() {
      this.activePanel = null;
      this.isSubmissionPanelOpen = false;
      this.isSettingsPanelOpen = false;
      this.isAuthPanelOpen = false;
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

    showAuthPanel(mode: "login" | "signup" = "login") {
      this.openAuthPanel(mode);
    },

    hideAuthPanel() {
      if (this.isAuthPanelOpen) {
        this.closeAllPanels();
      }
    },
  },

  getters: {
    hasOpenPanel: (state) => state.activePanel !== null,
  },
});
