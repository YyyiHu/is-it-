<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";

defineProps<{
  loading?: boolean;
}>();

defineEmits<{
  (e: "click"): void;
}>();
</script>

<template>
  <button class="load-new-button" :disabled="loading" @click="$emit('click')">
    <span class="flex items-center justify-center">
      <Loader2 v-if="loading" :size="18" class="animate-spin" />
    </span>
    <span>Load New</span>
  </button>
</template>

<style scoped>
.load-new-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: linear-gradient(
    135deg,
    var(--accent) 0%,
    var(--accent-hover) 100%
  );
  color: var(--white-000);
  border: none;
  outline: none;
  border-radius: var(--radius-full);
  font-family: var(--font-primary);
  font-weight: var(--font-weight-medium);
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
  transform: translateY(0);
}

.load-new-button:hover:not(:disabled) {
  background: linear-gradient(
    135deg,
    var(--accent-hover) 0%,
    var(--dark-800) 100%
  );
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.load-new-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.load-new-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.load-new-button:focus {
  outline: none;
  box-shadow: var(--shadow-md), 0 0 0 3px rgba(57, 84, 94, 0.2);
}

/* Responsive adjustments */
@media (min-width: 1024px) {
  .load-new-button {
    padding: var(--spacing-sm) var(--spacing-xl);
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .load-new-button {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .load-new-button {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 0.85rem;
  }
}
</style>
