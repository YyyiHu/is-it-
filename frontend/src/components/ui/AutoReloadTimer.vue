<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Clock } from "lucide-vue-next";
import { autoReloadService } from "@/services/auto-reload";

// Props
const props = defineProps({
  showBackground: {
    type: Boolean,
    default: true,
  },
});

// State
const timeLeft = ref("");
const intervalId = ref<number | null>(null);

// Format seconds to MM:SS
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// Update time left
const updateTimeLeft = () => {
  const status = autoReloadService.getStatus();

  if (!status.enabled || !status.hasActiveTimer) {
    timeLeft.value = "";
    return;
  }

  // Calculate time left based on when timer was started
  const lastStartTime = autoReloadService.getLastStartTime();
  const elapsedMs = Date.now() - lastStartTime;
  const totalMs = status.interval * 60 * 1000;
  const remainingMs = Math.max(0, totalMs - elapsedMs);
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  // Debug logging occasionally (every 10 seconds)
  if (remainingSeconds % 10 === 0) {
    console.log("Timer display update:", {
      remaining: `${Math.floor(remainingSeconds / 60)}:${(remainingSeconds % 60)
        .toString()
        .padStart(2, "0")}`,
      elapsedMs,
      totalMs,
    });
  }

  timeLeft.value = formatTime(remainingSeconds);
};

// Start timer on mount
onMounted(() => {
  updateTimeLeft();
  intervalId.value = window.setInterval(updateTimeLeft, 1000);
});

// Clean up on unmount
onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
});
</script>

<template>
  <div
    v-if="autoReloadService.enabled && timeLeft"
    :class="['auto-reload-timer', { 'with-bg': showBackground }]"
  >
    <Clock :size="14" />
    <span>{{ timeLeft }}</span>
  </div>
</template>

<style scoped>
.auto-reload-timer {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  transition: all 0.2s ease;
}

@media (max-width: 480px) {
  .auto-reload-timer {
    font-size: 0.65rem;
    padding: 1px 6px;
    gap: 2px;
  }

  .auto-reload-timer svg {
    width: 12px;
    height: 12px;
  }
}

.with-bg {
  background-color: var(--background-secondary);
  box-shadow: var(--shadow-sm);
}
</style>
