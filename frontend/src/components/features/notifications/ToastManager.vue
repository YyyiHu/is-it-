<script setup lang="ts">
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-vue-next";
import { useNotificationStore } from "@/stores/notification";

const notificationStore = useNotificationStore();

const getIcon = (type: string) => {
  switch (type) {
    case "success":
      return CheckCircle;
    case "error":
      return XCircle;
    case "warning":
      return AlertTriangle;
    case "info":
    default:
      return Info;
  }
};

const getIconColor = (type: string) => {
  switch (type) {
    case "success":
      return "text-green-600";
    case "error":
      return "text-error-red";
    case "warning":
      return "text-orange-600";
    case "info":
    default:
      return "text-blue-600";
  }
};

const getBorderColor = (type: string) => {
  switch (type) {
    case "success":
      return "border-green-200";
    case "error":
      return "border-error-border";
    case "warning":
      return "border-orange-200";
    case "info":
    default:
      return "border-blue-200";
  }
};

const getBackgroundColor = (type: string) => {
  switch (type) {
    case "success":
      return "bg-green-50";
    case "error":
      return "bg-error-bg";
    case "warning":
      return "bg-orange-50";
    case "info":
    default:
      return "bg-blue-50";
  }
};
</script>

<template>
  <!-- Toast notifications (right side) -->
  <div class="toast-container">
    <TransitionGroup name="notification" tag="div">
      <div
        v-for="notification in notificationStore.notifications"
        :key="notification.id"
        :class="[
          'toast-notification',
          getBorderColor(notification.type),
          getBackgroundColor(notification.type),
        ]"
      >
        <div class="toast-content">
          <div class="toast-icon">
            <component
              :is="getIcon(notification.type)"
              :size="20"
              :class="getIconColor(notification.type)"
            />
          </div>

          <div class="toast-text">
            <h4 class="toast-title">
              {{ notification.title }}
            </h4>
            <p v-if="notification.message" class="toast-message">
              {{ notification.message }}
            </p>
          </div>

          <button
            class="toast-close"
            @click="notificationStore.removeNotification(notification.id)"
            aria-label="Close notification"
          >
            <X :size="16" />
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: var(--spacing-2xl);
  right: var(--spacing-md);
  z-index: var(--z-fixed);
  width: 100%;
  max-width: 24rem;
  pointer-events: none;
}

.toast-notification {
  background: var(--background);
  border: 1px solid;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-sm);
  overflow: hidden;
  pointer-events: auto;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  padding: var(--spacing-md);
  gap: var(--spacing-sm);
}

.toast-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.toast-text {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.toast-message {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  padding: 4px;
  border-radius: var(--radius-sm);
  color: var(--grey-400);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.toast-close:hover {
  color: var(--text-secondary);
  background-color: var(--black-shadow-08);
}

/* Toast animations */
.notification-enter-active {
  transition: all var(--transition-normal) ease-out;
}

.notification-leave-active {
  transition: all var(--transition-normal) ease-in;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform var(--transition-normal);
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .toast-container {
    right: var(--spacing-sm);
    max-width: calc(100vw - var(--spacing-lg));
    top: var(--spacing-xl);
  }

  .toast-content {
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);
  }

  .toast-title {
    font-size: 13px;
  }

  .toast-message {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .toast-container {
    right: var(--spacing-xs);
    max-width: calc(100vw - var(--spacing-md));
    top: var(--spacing-lg);
  }

  .toast-content {
    padding: var(--spacing-sm);
    gap: var(--spacing-xs);
  }

  .toast-title {
    font-size: 12px;
  }

  .toast-message {
    font-size: 12px;
    line-height: 1.3;
  }

  .toast-icon svg {
    width: 18px;
    height: 18px;
  }

  .toast-close svg {
    width: 14px;
    height: 14px;
  }
}
</style>
