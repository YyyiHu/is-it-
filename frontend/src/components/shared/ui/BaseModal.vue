<script setup lang="ts">
interface Props {
  show: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

interface Emits {
  (e: "confirm"): void;
  (e: "cancel"): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Confirm Action",
  message: "Are you sure you want to proceed?",
  confirmText: "Confirm",
  cancelText: "Cancel",
  variant: "warning",
});

const emit = defineEmits<Emits>();

const handleConfirm = () => {
  emit("confirm");
};

const handleCancel = () => {
  emit("cancel");
};

const handleOverlayClick = () => {
  emit("cancel");
};
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 flex items-center justify-center z-[1400] p-4"
        style="background: var(--modal-overlay)"
        @click="handleOverlayClick"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="show"
            class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
            @click.stop
          >
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center gap-3">
                <!-- Icon based on variant -->
                <div
                  class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  :class="{
                    'bg-red-100': variant === 'danger',
                    'bg-yellow-100': variant === 'warning',
                    'bg-blue-100': variant === 'info',
                  }"
                >
                  <!-- Danger icon -->
                  <svg
                    v-if="variant === 'danger'"
                    class="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>

                  <!-- Warning icon -->
                  <svg
                    v-else-if="variant === 'warning'"
                    class="w-5 h-5 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>

                  <!-- Info icon -->
                  <svg
                    v-else
                    class="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                <h3 class="text-lg font-semibold text-gray-900">
                  {{ title }}
                </h3>
              </div>
            </div>

            <!-- Content -->
            <div class="px-6 py-4">
              <p class="text-gray-600 leading-relaxed">
                {{ message }}
              </p>
            </div>

            <!-- Actions -->
            <div
              class="px-6 py-4 bg-gray-50 rounded-b-lg flex gap-3 justify-end"
            >
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                @click="handleCancel"
              >
                {{ cancelText }}
              </button>

              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                :class="{
                  'bg-red-600 hover:bg-red-700 focus:ring-red-500':
                    variant === 'danger',
                  'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500':
                    variant === 'warning',
                  'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500':
                    variant === 'info',
                }"
                @click="handleConfirm"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
