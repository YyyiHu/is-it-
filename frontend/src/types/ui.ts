export interface UiState {
  activePanel: "submission" | "settings" | "auth" | null;
  isSubmissionPanelOpen: boolean;
  isSettingsPanelOpen: boolean;
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
