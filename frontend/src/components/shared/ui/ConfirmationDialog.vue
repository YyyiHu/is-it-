<script setup lang="ts">
import BaseModal from "./BaseModal.vue";

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

defineEmits<Emits>();
</script>

<template>
  <BaseModal
    :show="show"
    :title="title"
    :message="message"
    :confirm-text="confirmText"
    :cancel-text="cancelText"
    :variant="variant"
    @confirm="$emit('confirm')"
    @cancel="$emit('cancel')"
  />
</template>
