<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Clock } from "lucide-vue-next";
import { autoReloadService } from "@/services";
import { useAuthStore } from "@/stores/auth";
import { formatTime } from "@/utils";

// Props
const props = defineProps({
  showBackground: {
    type: Boolean,
    default: true,
  },
});

// Store
const authStore = useAuthStore();

// State
const timeLeft = ref("");
const intervalId = ref<number | null>(null);

// Update time left - simplified
const updateTimeLeft = () => {
  if (!authStore.isAuthenticated) {
    timeLeft.value = "";
    return;
  }

  const timerInfo = autoReloadService.getTimerInfo();

  // Only show timer if enabled and active
  if (!timerInfo.enabled || !timerInfo.isActive || timerInfo.startTime === 0) {
    timeLeft.value = "";
    return;
  }

  const elapsedMs = Date.now() - timerInfo.startTime;
  const totalMs = timerInfo.interval * 60 * 1000;
  const remainingMs = Math.max(0, totalMs - elapsedMs);
  const remainingSeconds = Math.ceil(remainingMs / 1000);

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
    v-if="authStore.isAuthenticated && autoReloadService.enabled && timeLeft"
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
