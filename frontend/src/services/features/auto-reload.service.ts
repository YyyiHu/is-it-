import { ref } from "vue";
import { useEpigramStore } from "@/stores/epigram";

// AutoReloadService - Singleton timer for epigram auto-reload
class AutoReloadService {
  private timerId: number | null = null;
  private isEnabled = ref(false);
  private intervalMinutes = ref(5);
  private startTime = ref(0);

  updateSettings(settings: { enabled: boolean; interval: number }): void {
    this.isEnabled.value = settings.enabled;
    this.intervalMinutes.value = settings.interval;

    this.stop(); // Always stop existing timer

    if (settings.enabled && settings.interval > 0) {
      this.start();
    }
  }

  /**
   * Start/restart timer with full interval
   */
  start(): void {
    if (!this.isEnabled.value || this.intervalMinutes.value <= 0) {
      return;
    }

    this.stop(); // Ensure singleton
    this.startTime.value = Date.now();

    const intervalMs = this.intervalMinutes.value * 60 * 1000;

    this.timerId = window.setTimeout(() => {
      if (this.isEnabled.value) {
        // Check if still enabled
        const epigramStore = useEpigramStore();
        epigramStore.loadNextEpigram().then(() => {
          this.start(); // Restart for next cycle
        });
      }
    }, intervalMs);
  }

  /**
   * Stop timer
   */
  stop(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.startTime.value = 0;
  }

  /**
   * Reset timer (when new epigram is manually displayed)
   */
  reset(): void {
    if (this.isEnabled.value) {
      this.start();
    }
  }

  /**
   * Get timer info for UI
   */
  getTimerInfo(): {
    enabled: boolean;
    interval: number;
    isActive: boolean;
    startTime: number;
  } {
    return {
      enabled: this.isEnabled.value,
      interval: this.intervalMinutes.value,
      isActive: this.timerId !== null,
      startTime: this.startTime.value,
    };
  }

  // Simple getters
  get enabled(): boolean {
    return this.isEnabled.value;
  }

  get interval(): number {
    return this.intervalMinutes.value;
  }
}

// Export singleton instance
export const autoReloadService = new AutoReloadService();
