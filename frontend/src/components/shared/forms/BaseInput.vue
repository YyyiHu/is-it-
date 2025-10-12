<script setup lang="ts">
import { computed, useAttrs } from "vue";

interface Props {
  modelValue?: string | number;
  label?: string;
  placeholder?: string;
  type?: "text" | "password" | "email" | "number";
  required?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
  maxlength?: number;
  minlength?: number;
  showCharCount?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "filled";
}

interface Emits {
  (e: "update:modelValue", value: string | number): void;
  (e: "blur"): void;
  (e: "focus"): void;
  (e: "input"): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  type: "text",
  required: false,
  disabled: false,
  showCharCount: false,
  size: "md",
  variant: "default",
});

const emit = defineEmits<Emits>();
const attrs = useAttrs();

const inputId = computed(() => {
  if (attrs.id) return attrs.id as string;
  return `input-${Math.random().toString(36).substr(2, 9)}`;
});

const inputClasses = computed(() => {
  const base =
    "w-full border-2 font-theme-medium transition-theme-fast focus:outline-none focus:ring-2 rounded-theme-lg";

  let size = "";
  let variant = "";
  let state = "";

  // Size classes
  switch (props.size) {
    case "sm":
      size = "px-3 py-2 text-sm";
      break;
    case "lg":
      size = "px-4 py-3 text-lg";
      break;
    default: // md
      size = "px-3.5 py-2.5 text-base";
  }

  // Variant classes
  if (props.variant === "filled") {
    variant = "bg-theme-secondary border-theme-light";
  } else {
    variant = "bg-theme-primary border-theme-primary";
  }

  // State classes
  if (props.error) {
    state =
      "border-theme-error focus:border-theme-error focus:ring-theme-error-light";
  } else {
    state = "focus:border-theme-accent focus:ring-theme-accent-light";
  }

  if (props.disabled) {
    state += " opacity-60 cursor-not-allowed bg-theme-tertiary";
  }

  return `${base} ${size} ${variant} ${state}`;
});

const labelClasses = computed(() => {
  const base = "block text-sm font-theme-medium mb-2";
  return props.error
    ? `${base} text-theme-error`
    : `${base} text-theme-secondary`;
});

const characterCount = computed(() => {
  const value = String(props.modelValue || "");
  return value.length;
});

const isOverLimit = computed(() => {
  return props.maxlength ? characterCount.value > props.maxlength : false;
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = props.type === "number" ? Number(target.value) : target.value;
  emit("update:modelValue", value);
};

const handleBlur = () => {
  emit("blur");
};

const handleFocus = () => {
  emit("focus");
};
</script>

<template>
  <div class="form-input-wrapper">
    <!-- Label -->
    <label v-if="label" :for="inputId" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-error-red ml-1">*</span>
      <span v-else-if="!required" class="text-text-tertiary font-normal ml-1"
        >(optional)</span
      >
    </label>

    <!-- Input -->
    <input
      :id="inputId"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :maxlength="maxlength"
      :minlength="minlength"
      :class="inputClasses"
      v-bind="$attrs"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    />

    <!-- Footer with error/hint and character count -->
    <div
      v-if="error || hint || (showCharCount && maxlength)"
      class="flex justify-between items-start mt-2 gap-2"
    >
      <!-- Error or Hint -->
      <div class="flex-1">
        <p v-if="error" class="text-sm text-error-red">
          {{ error }}
        </p>
        <p v-else-if="hint" class="text-sm text-text-tertiary">
          {{ hint }}
        </p>
      </div>

      <!-- Character Count -->
      <div
        v-if="showCharCount && maxlength"
        class="text-sm flex-shrink-0"
        :class="isOverLimit ? 'text-error-red' : 'text-text-tertiary'"
      >
        {{ characterCount }}/{{ maxlength }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-input-wrapper {
  @apply mb-4;
}

/* Remove default input styling */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
