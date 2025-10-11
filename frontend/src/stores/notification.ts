import { defineStore } from "pinia";

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: "primary" | "secondary" | "danger";
}

export interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
  duration?: number; // in milliseconds, 0 means persistent
}

interface NotificationState {
  notifications: Notification[];
}

export const useNotificationStore = defineStore("notification", {
  state: (): NotificationState => ({
    notifications: [],
  }),

  actions: {
    addNotification(notification: Omit<Notification, "id">): string {
      const id =
        Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newNotification: Notification = {
        id,
        duration: 3000, // Default 3 seconds
        ...notification,
      };

      this.notifications.push(newNotification);

      // Auto remove after duration (unless duration is 0)
      if (newNotification.duration && newNotification.duration > 0) {
        setTimeout(() => {
          this.removeNotification(id);
        }, newNotification.duration);
      }

      return id;
    },

    removeNotification(id: string): void {
      const index = this.notifications.findIndex((n) => n.id === id);
      if (index > -1) {
        this.notifications.splice(index, 1);
      }
    },

    clearAll(): void {
      this.notifications = [];
    },

    // Convenience methods for toast notifications only
    success(title: string, message?: string, duration?: number): string {
      return this.addNotification({
        type: "success",
        title,
        message: message || "",
        duration,
      });
    },

    error(title: string, message?: string, duration?: number): string {
      return this.addNotification({
        type: "error",
        title,
        message: message || "",
        duration,
      });
    },

    info(title: string, message?: string, duration?: number): string {
      return this.addNotification({
        type: "info",
        title,
        message: message || "",
        duration,
      });
    },

    warning(title: string, message?: string, duration?: number): string {
      return this.addNotification({
        type: "warning",
        title,
        message: message || "",
        duration,
      });
    },
  },
});
