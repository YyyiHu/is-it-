<script setup lang="ts">
import PanelHeader from "@/components/shared/ui/PanelHeader.vue";

interface Props {
  show: boolean;
  title: string;
  icon?: any;
  maxWidth?: string;
  hideCloseButton?: boolean;
}

interface Emits {
  (e: "close"): void;
}

withDefaults(defineProps<Props>(), {
  maxWidth: "max-w-4xl",
  hideCloseButton: false,
});

const emit = defineEmits<Emits>();

const handleClose = () => {
  emit("close");
};

const handleOverlayClick = () => {
  emit("close");
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-theme-fixed"
    @mousedown.self="handleOverlayClick"
  >
    <div
      :class="[
        'w-full bg-white rounded-lg shadow-xl overflow-hidden',
        maxWidth,
      ]"
      @click.stop
    >
      <!-- Header -->
      <PanelHeader
        :title="title"
        :icon="icon"
        :hide-close-button="hideCloseButton"
        @close="handleClose"
      />

      <!-- Content -->
      <div class="overflow-y-auto">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
