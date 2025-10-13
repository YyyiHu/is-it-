<script setup lang="ts">
import { RotateCcw, Loader2 } from "lucide-vue-next";

defineProps<{
  loading?: boolean;
}>();

defineEmits<{
  (e: "click"): void;
}>();
</script>

<template>
  <button
    class="refresh-button"
    :class="{ loading: loading }"
    :disabled="loading"
    @click="$emit('click')"
    :title="loading ? 'Loading...' : 'Load new epigram'"
  >
    <!-- Use Loader2 for loading state, RotateCcw for refresh -->
    <Loader2 v-if="loading" :size="20" class="animate-spin" />
    <RotateCcw v-else :size="20" />
  </button>
</template>

<style scoped>
.refresh-button {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  background: var(--white-overlay-90);
  border: 1px solid var(--border-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(4px);
  color: var(--accent);
}

.refresh-button:hover:not(:disabled) {
  background: white;
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
  color: var(--accent-hover);
}

.refresh-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Use Tailwind's animate-spin class - no custom animation needed */

/* Responsive adjustments */
@media (max-width: 768px) {
  .refresh-button {
    width: 36px;
    height: 36px;
    bottom: 10px;
    right: 10px;
  }
}

@media (max-width: 480px) {
  .refresh-button {
    width: 28px;
    height: 28px;
    bottom: 8px;
    right: 8px;
  }

  .refresh-button svg {
    width: 14px;
    height: 14px;
  }
}
</style>
