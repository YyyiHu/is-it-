export interface UiState {
  activePanel: "submission" | "settings" | "history" | "auth" | null;
  isSubmissionPanelOpen: boolean;
  isSettingsPanelOpen: boolean;
  isHistoryPanelOpen: boolean;
  isAuthPanelOpen: boolean;
  authPanelMode: "login" | "signup";
}

export interface SubmissionForm {
  text: string;
  author: string;
  isSubmitting: boolean;
  errors: {
    text?: string;
    author?: string;
    general?: string;
  };
}
