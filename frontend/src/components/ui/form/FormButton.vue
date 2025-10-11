<script setup lang="ts">
import { computed } from "vue";

interface Props {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
}

interface Emits {
  (e: "click"): void;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "md",
  disabled: false,
  loading: false,
  type: "button",
});

const emit = defineEmits<Emits>();

const isDisabled = computed(() => props.disabled || props.loading);

const handleClick = () => {
  if (!isDisabled.value) {
    emit("click");
  }
};

const buttonClasses = computed(() => {
  const base =
    "inline-flex items-center justify-center gap-2 border-0 outline-none rounded-md font-medium transition-all";

  let variant = "";
  let size = "";
  let state = "";

  // Variant classes - using your theme colors
  if (props.variant === "primary") {
    variant = isDisabled.value
      ? "bg-grey-300 text-text-tertiary"
      : "bg-accent text-white-000 hover:bg-accent-hover focus:ring-2 focus:ring-accent focus:ring-offset-2";
  } else if (props.variant === "secondary") {
    variant = isDisabled.value
      ? "bg-transparent text-text-tertiary border border-grey-300"
      : "bg-transparent text-text-secondary border border-border hover:bg-background-tertiary focus:ring-2 focus:ring-accent focus:ring-offset-2";
  } else if (props.variant === "danger") {
    variant = isDisabled.value
      ? "bg-grey-300 text-text-tertiary"
      : "bg-error-red text-white-000 hover:bg-red-600 focus:ring-2 focus:ring-error-red focus:ring-offset-2";
  }

  // Size classes
  if (props.size === "sm") {
    size = "px-3 py-1.5 text-sm";
  } else if (props.size === "md") {
    size = "px-4 py-2 text-base";
  } else if (props.size === "lg") {
    size = "px-6 py-3 text-lg";
  }

  // State classes
  state = isDisabled.value ? "cursor-not-allowed" : "cursor-pointer";

  return `${base} ${variant} ${size} ${state}`;
});
</script>

<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="isDisabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
