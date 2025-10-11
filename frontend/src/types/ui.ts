export interface UiState {
  activePanel: "submission" | "settings" | null;
  isSubmissionPanelOpen: boolean;
  isSettingsPanelOpen: boolean;
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
