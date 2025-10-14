<script setup lang="ts">
import { X } from "lucide-vue-next";

interface Props {
  title: string;
  icon?: any;
  hideCloseButton?: boolean;
}

interface Emits {
  (e: "close"): void;
}

withDefaults(defineProps<Props>(), {
  hideCloseButton: false,
});

const emit = defineEmits<Emits>();

const handleClose = () => {
  emit("close");
};
</script>

<template>
  <div class="flex justify-between items-center p-6 border-b border-gray-200">
    <h3 class="text-xl font-semibold text-gray-900 m-0 flex items-center gap-2">
      <component v-if="icon" :is="icon" :size="24" />
      {{ title }}
    </h3>
    <button
      v-if="!hideCloseButton"
      class="flex items-center justify-center text-gray-400 bg-transparent border-0 outline-none rounded-full w-8 h-8 transition-colors hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
      @click="handleClose"
      aria-label="Close panel"
    >
      <X :size="20" />
    </button>
  </div>
</template>

