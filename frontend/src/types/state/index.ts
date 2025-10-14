/**
 * State management related types
 */

/**
 * Component and store loading state
 * Used for tracking async operations status and errors
 */
export interface AsyncOperationState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Legacy type name for backward compatibility
 * @deprecated Use AsyncOperationState instead
 */
export type LoadingState = AsyncOperationState;
