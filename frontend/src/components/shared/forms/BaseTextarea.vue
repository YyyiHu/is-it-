<script setup lang="ts">
import { computed, useAttrs } from "vue";

interface Props {
  modelValue?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
  maxlength?: number;
  minlength?: number;
  rows?: number;
  showCharCount?: boolean;
  resize?: "none" | "vertical" | "horizontal" | "both";
  size?: "sm" | "md" | "lg";
}

interface Emits {
  (e: "update:modelValue", value: string): void;
  (e: "blur"): void;
  (e: "focus"): void;
  (e: "input"): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  required: false,
  disabled: false,
  rows: 4,
  showCharCount: false,
  resize: "vertical",
  size: "md",
});

const emit = defineEmits<Emits>();
const attrs = useAttrs();

const textareaId = computed(() => {
  if (attrs.id) return attrs.id as string;
  return `textarea-${Math.random().toString(36).substr(2, 9)}`;
});

const textareaClasses = computed(() => {
  const base =
    "w-full border-2 font-theme-medium transition-theme-fast focus:outline-none focus:ring-2 rounded-theme-lg";

  let size = "";
  let variant = "bg-theme-primary border-theme-primary"; // Consistent with BaseInput
  let state = "";
  let resizeClass = "";

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

  // Resize classes
  switch (props.resize) {
    case "none":
      resizeClass = "resize-none";
      break;
    case "horizontal":
      resizeClass = "resize-x";
      break;
    case "both":
      resizeClass = "resize";
      break;
    default: // vertical
      resizeClass = "resize-y";
  }

  return `${base} ${size} ${variant} ${state} ${resizeClass}`;
});

const labelClasses = computed(() => {
  const base = "block text-sm font-theme-medium mb-2";
  return props.error
    ? `${base} text-theme-error`
    : `${base} text-theme-secondary`;
});

const characterCount = computed(() => {
  return (props.modelValue || "").length;
});

const isOverLimit = computed(() => {
  return props.maxlength ? characterCount.value > props.maxlength : false;
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit("update:modelValue", target.value);
};

const handleBlur = () => {
  emit("blur");
};

const handleFocus = () => {
  emit("focus");
};
</script>

<template>
  <div class="form-textarea-wrapper">
    <!-- Label -->
    <label v-if="label" :for="textareaId" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
      <span v-else-if="!required" class="text-gray-400 font-normal ml-1"
        >(optional)</span
      >
    </label>

    <!-- Textarea -->
    <textarea
      :id="textareaId"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :maxlength="maxlength"
      :minlength="minlength"
      :rows="rows"
      :class="textareaClasses"
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
        <p v-if="error" class="text-sm text-red-600">
          {{ error }}
        </p>
        <p v-else-if="hint" class="text-sm text-gray-500">
          {{ hint }}
        </p>
      </div>

      <!-- Character Count -->
      <div
        v-if="showCharCount && maxlength"
        class="text-sm flex-shrink-0"
        :class="isOverLimit ? 'text-red-600' : 'text-gray-500'"
      >
        {{ characterCount }}/{{ maxlength }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-textarea-wrapper {
  @apply mb-4;
}

/* Custom focus ring for better accessibility */
textarea:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

textarea.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
</style>
