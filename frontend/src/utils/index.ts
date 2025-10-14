/**
 * Utility functions used throughout the application
 */

/**
 * Formats time in seconds to MM:SS format
 * @param seconds - Time in seconds
 * @returns Formatted time string
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Generates a unique ID for use in components
 * @returns A unique string ID
 */
export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 9);
}
