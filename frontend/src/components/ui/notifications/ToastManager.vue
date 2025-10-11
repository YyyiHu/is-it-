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
      return "text-green-500";
    case "error":
      return "text-error-red";
    case "warning":
      return "text-orange-500";
    case "info":
    default:
      return "text-blue-500";
  }
};

const getBorderColor = (type: string) => {
  switch (type) {
    case "success":
      return "border-green-200";
    case "error":
      return "border-red-200";
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
      return "bg-red-50";
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
  top: 5rem;
  right: 1rem;
  z-index: 900;
  width: 100%;
  max-width: 24rem;
  pointer-events: none;
}

.toast-notification {
  background: white;
  border: 1px solid;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 8px;
  overflow: hidden;
  pointer-events: auto;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  gap: 12px;
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
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.toast-message {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  padding: 4px;
  border-radius: 4px;
  color: #9ca3af;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toast-close:hover {
  color: #6b7280;
  background-color: rgba(0, 0, 0, 0.05);
}

/* Toast animations */
.notification-enter-active {
  transition: all 0.3s ease-out;
}

.notification-leave-active {
  transition: all 0.3s ease-in;
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
  transition: transform 0.3s ease;
}

/* Mobile responsive adjustments - keep right positioning but ensure no cutoff */
@media (max-width: 768px) {
  .toast-container {
    right: 0.75rem; /* Slightly less margin to prevent cutoff */
    max-width: calc(100vw - 1.5rem); /* Ensure it fits within viewport */
    top: 4rem;
  }

  .toast-content {
    padding: 12px;
    gap: 10px;
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
    right: 0.5rem; /* Even less margin on very small screens */
    max-width: calc(100vw - 1rem); /* Tighter fit */
    top: 3.5rem;
  }

  .toast-content {
    padding: 10px;
    gap: 8px;
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
