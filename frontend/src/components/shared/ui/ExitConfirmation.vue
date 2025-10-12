<script setup lang="ts">
import BaseModal from "./BaseModal.vue";

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
  <BaseModal
    :show="show"
    :title="title"
    :message="message"
    confirm-text="Leave"
    cancel-text="Cancel"
    variant="warning"
    @confirm="$emit('confirm')"
    @cancel="$emit('cancel')"
  />
</template>
