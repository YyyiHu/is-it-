<script setup lang="ts">
interface Props {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "accent" | "white" | "gray";
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  color: "accent",
});

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6", 
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

const colorClasses = {
  primary: "border-text-primary",
  accent: "border-accent",
  white: "border-white",
  gray: "border-gray-400",
};
</script>

<template>
  <div
    class="app-spinner animate-spin rounded-full border-2 border-solid border-t-transparent"
    :class="[sizeClasses[size], colorClasses[color]]"
    role="status"
    aria-label="Loading"
  >
    <span class="sr-only">Loading...</span>
  </div>
</template>

<style scoped lang="postcss">
.app-spinner {
  border-color: var(--accent);
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

.app-spinner.border-text-primary {
  border-color: var(--text-primary);
  border-top-color: transparent;
}

.app-spinner.border-accent {
  border-color: var(--accent);
  border-top-color: transparent;
}

.app-spinner.border-white {
  border-color: var(--white-000);
  border-top-color: transparent;
}

.app-spinner.border-gray-400 {
  border-color: var(--grey-400);
  border-top-color: transparent;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
