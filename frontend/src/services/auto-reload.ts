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

  constructor() {
    this.loadSettings();
  }

  /**
   * Load saved settings from localStorage
   */
  private loadSettings() {
    try {
      const saved = localStorage.getItem("appSettings");
      if (saved) {
        const settings = JSON.parse(saved);
        this.isEnabled.value = settings.autoReload || false;
        this.intervalMinutes.value = settings.minutes || 5;
      }
    } catch (error) {
      console.warn("Failed to load auto-reload settings");
    }
  }

  /**
   * Update settings (called from settings panel)
   */
  updateSettings(enabled: boolean, intervalMinutes: number) {
    console.log(
      `Settings updated: ${enabled ? intervalMinutes + "min" : "disabled"}`
    );

    this.isEnabled.value = enabled;
    this.intervalMinutes.value = intervalMinutes;

    this.stop();

    if (enabled) {
      this.startFullTimer();
    }
  }

  /**
   * Start timer with full interval
   * Called after: settings change, manual refresh, successful submission
   */
  startFullTimer() {
    if (!this.isEnabled.value) {
      console.log("Auto-reload disabled, not starting timer");
      return;
    }

    // ALWAYS stop any existing timer first
    this.stop();

    const intervalMs = this.intervalMinutes.value * 60 * 1000;
    this.lastStartTime.value = Date.now();

    console.log(
      `Starting timer: ${this.intervalMinutes.value}min (${intervalMs}ms)`
    );
    console.log(
      `Will expire at: ${new Date(Date.now() + intervalMs).toISOString()}`
    );

    this.timerId = window.setTimeout(() => {
      console.log("Timer expired - loading next epigram");

      const epigramStore = useEpigramStore();
      epigramStore.loadNextEpigram("auto-reload-timer-expired").then(() => {
        this.startFullTimer(); // Start next cycle
      });
    }, intervalMs);

    console.log(`Timer created with ID: ${this.timerId}`);
  }

  /**
   * Stop the current timer
   */
  stop() {
    if (this.timerId) {
      console.log(`Stopping timer ID: ${this.timerId}`);
      clearTimeout(this.timerId);
      this.timerId = null;
    } else {
      console.log("No active timer to stop");
    }
  }

  /**
   * Get status for display component
   */
  getStatus() {
    return {
      enabled: this.isEnabled.value,
      interval: this.intervalMinutes.value,
      hasActiveTimer: this.timerId !== null,
    };
  }

  /**
   * Get when timer was last started (for display countdown)
   */
  getLastStartTime() {
    return this.lastStartTime.value;
  }

  // Getters for components
  get enabled() {
    return this.isEnabled.value;
  }

  get interval() {
    return this.intervalMinutes.value;
  }
}

// Export singleton instance
export const autoReloadService = new AutoReloadService();
