import { ref } from "vue";
import { useEpigramStore } from "@/stores/epigram";

/**
 * AutoReloadService manages the automatic timer-based epigram refresh.
 * It maintains a single timer that counts down and loads a new epigram when it reaches zero.
 */
class AutoReloadService {
  private timerId: number | null = null;
  private isEnabled = ref(false);
  private intervalMinutes = ref(5);
  private lastStartTime = ref(Date.now());
  private isInitialized = ref(false);

  constructor() {
    // Settings will be loaded by useUserSettings composable
  }

  /**
   * Update settings and restart timer
   * @param settings Object containing enabled state and interval
   */
  updateSettings(settings: { enabled: boolean; interval: number }): void {
    this.isEnabled.value = settings.enabled;
    this.intervalMinutes.value = settings.interval;
    this.isInitialized.value = true;

    // Always stop any existing timer
    this.stop();

    // Reset start time for fresh timer
    this.lastStartTime.value = Date.now();

    // Start timer if enabled with small delay for UI updates
    if (settings.enabled) {
      setTimeout(() => {
        this.startFullTimer();
      }, 100);
    }
  }

  /**
   * Start timer with full interval
   */
  startFullTimer(): void {
    // Don't start if not enabled or not initialized
    if (!this.isEnabled.value || !this.isInitialized.value) {
      return;
    }

    // Validate interval
    if (
      !this.intervalMinutes.value ||
      this.intervalMinutes.value <= 0 ||
      this.intervalMinutes.value > 240
    ) {
      // Invalid interval, use default
      this.intervalMinutes.value = 5;
      return;
    }

    // Stop any existing timer and reset start time
    this.stop();
    this.lastStartTime.value = Date.now();

    const intervalMs = this.intervalMinutes.value * 60 * 1000;

    this.timerId = window.setTimeout(() => {
      const epigramStore = useEpigramStore();
      epigramStore.loadNextEpigram("auto-reload-timer-expired").then(() => {
        this.startFullTimer(); // Start next cycle
      });
    }, intervalMs);
  }

  /**
   * Stop the current timer
   */
  stop(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Get status for display component
   */
  getStatus(): {
    enabled: boolean;
    interval: number;
    hasActiveTimer: boolean;
    isInitialized: boolean;
  } {
    // If timer should be enabled but isn't active, restart it
    if (
      this.isEnabled.value &&
      this.isInitialized.value &&
      this.timerId === null
    ) {
      // Use setTimeout to avoid infinite recursion
      setTimeout(() => this.startFullTimer(), 0);
    }

    return {
      enabled: this.isEnabled.value,
      interval: this.intervalMinutes.value,
      hasActiveTimer: this.timerId !== null,
      isInitialized: this.isInitialized.value,
    };
  }

  /**
   * Get when timer was last started (for display countdown)
   */
  getLastStartTime(): number {
    return this.lastStartTime.value;
  }

  // Getters for components
  get enabled(): boolean {
    return this.isEnabled.value;
  }

  get interval(): number {
    return this.intervalMinutes.value;
  }
}

// Export singleton instance
export const autoReloadService = new AutoReloadService();
