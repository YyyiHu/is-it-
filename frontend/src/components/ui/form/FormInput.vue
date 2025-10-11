<script setup lang="ts">
interface Props {
  modelValue: string | undefined;
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  maxlength?: number;
  showCharCount?: boolean;
}

interface Emits {
  (e: "update:modelValue", value: string): void;
  (e: "input"): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  placeholder: "",
  required: false,
  error: "",
  maxlength: undefined,
  showCharCount: false,
});

const emit = defineEmits<Emits>();

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
  emit("input");
};
</script>

<template>
  <div class="mb-6">
    <label class="block font-medium text-gray-900 mb-1 text-sm">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
      <span v-else class="text-gray-500 font-normal">(optional)</span>
    </label>

    <input
      :value="modelValue || ''"
      type="text"
      class="w-full px-3 py-2 border-2 rounded-md text-base transition-colors outline-none"
      :class="[
        error
          ? 'border-red-500 focus:border-red-500'
          : 'border-gray-300 focus:border-blue-500',
      ]"
      :placeholder="placeholder"
      :maxlength="maxlength"
      @input="handleInput"
    />

    <div
      v-if="error || (showCharCount && maxlength)"
      class="flex justify-between items-center mt-1"
    >
      <span v-if="error" class="text-sm text-red-500">
        {{ error }}
      </span>
      <span
        v-if="showCharCount && maxlength"
        class="text-sm text-gray-500"
        :class="{ 'ml-auto': error }"
      >
        {{ (modelValue || "").length }}/{{ maxlength }}
      </span>
    </div>
  </div>
</template>
