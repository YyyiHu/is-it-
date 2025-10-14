/**
 * UI-related types
 */

/**
 * UI state for managing panels and modals
 */
export interface UiState {
  activePanel: "submission" | "settings" | "history" | "auth" | null;
  isSubmissionPanelOpen: boolean;
  isSettingsPanelOpen: boolean;
  isHistoryPanelOpen: boolean;
  isAuthPanelOpen: boolean;
  authPanelMode: "login" | "signup";
}

/**
 * Submission form state
 */
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

/**
 * Base UI element properties
 */
export interface UIElementProps {
  className?: string;
  id?: string;
  style?: Record<string, string>;
}

/**
 * UI component size variants
 */
export type SizeVariant = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * UI component color variants
 */
export type ColorVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info";

