import { defineStore } from "pinia";
// Simple utility function to generate unique IDs
function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 9);
}

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
      const id = generateUniqueId();
      const newNotification: Notification = {
        id,
        duration: 2000, // Default 2 seconds
        ...notification,
      };

      this.notifications.push(newNotification);

      // Auto remove after duration (unless duration is 0)
      if (newNotification.duration && newNotification.duration > 0) {
        setTimeout(() => this.removeNotification(id), newNotification.duration);
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

    // Convenience methods for toast notifications
    notify(
      type: Notification["type"],
      title: string,
      message?: string,
      duration?: number
    ): string {
      return this.addNotification({
        type,
        title,
        message: message || "",
        duration: duration ?? 2000, // Default 2000ms if not provided
      });
    },

    success(title: string, message?: string, duration?: number): string {
      return this.notify("success", title, message, duration);
    },

    error(title: string, message?: string, duration?: number): string {
      return this.notify("error", title, message, duration);
    },

    info(title: string, message?: string, duration?: number): string {
      return this.notify("info", title, message, duration);
    },

    warning(title: string, message?: string, duration?: number): string {
      return this.notify("warning", title, message, duration);
    },
  },
});
