<script setup lang="ts">
import { AlertTriangle } from "lucide-vue-next";

interface Props {
  show: boolean;
  title: string;
  message: string;
}

interface Emits {
  (e: "confirm"): void;
  (e: "cancel"): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 flex items-center justify-center z-[1500] bg-black/30 backdrop-blur-sm"
      @click.self="$emit('cancel')"
    >
      <div 
        class="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 overflow-hidden transform transition-all"
        @click.stop
      >
        <div class="p-5">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 text-warning-orange">
              <AlertTriangle :size="24" />
            </div>
            
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 mb-1">
                {{ title }}
              </h3>
              <p class="text-sm text-gray-600">
                {{ message }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="bg-gray-50 px-5 py-4 flex justify-end gap-2">
          <button
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            @click="$emit('cancel')"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-orange-500 rounded-md hover:bg-orange-600 transition-colors"
            @click="$emit('confirm')"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>