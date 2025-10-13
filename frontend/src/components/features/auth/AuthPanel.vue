<template>
  <div class="auth-panel-overlay" @click="handleOverlayClick">
    <div class="auth-panel" @click.stop>
      <div class="auth-panel-header">
        <h2 class="auth-panel-title">
          {{ isLoginMode ? "Sign In" : "Sign Up" }}
        </h2>
        <button
          class="auth-panel-close"
          @click="$emit('close')"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div class="auth-panel-content">
        <form @submit.prevent="handleSubmit" class="auth-form">
          <!-- Username -->
          <BaseInput
            v-model="formData.username"
            label="Username"
            placeholder="Enter your username"
            :required="true"
            :disabled="isLoading"
            :error="fieldErrors.username"
            :minlength="3"
            :maxlength="50"
            :hint="'3-50 characters, letters, numbers, underscores, and hyphens only'"
            autocomplete="username"
            @blur="() => validateField('username')"
          />

          <!-- Password -->
          <BaseInput
            v-model="formData.password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            :required="true"
            :disabled="isLoading"
            :error="fieldErrors.password"
            :maxlength="100"
            :hint="
              isLoginMode
                ? undefined
                : 'Password must contain uppercase, lowercase, number, and special character'
            "
            autocomplete="current-password"
            @blur="() => validateField('password')"
          />

          <!-- Confirm Password (Sign Up only) -->
          <BaseInput
            v-if="!isLoginMode"
            v-model="formData.confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
            :required="true"
            :disabled="isLoading"
            :error="fieldErrors.confirmPassword"
            autocomplete="new-password"
            @blur="() => validateField('confirmPassword')"
          />

          <!-- Global Error -->
          <div v-if="error" class="auth-error">
            {{ error }}
          </div>

          <!-- Submit Button -->
          <BaseButton
            type="submit"
            :disabled="!isFormValid || isLoading"
            :loading="isLoading"
            variant="primary"
            size="lg"
            full-width
          >
            {{ isLoginMode ? "Sign In" : "Sign Up" }}
          </BaseButton>
        </form>

        <!-- Switch Mode -->
        <div class="auth-switch">
          <p>
            {{
              isLoginMode
                ? "Don't have an account?"
                : "Already have an account?"
            }}
            <button
              type="button"
              class="auth-switch-btn"
              @click="toggleMode"
              :disabled="isLoading"
            >
              {{ isLoginMode ? "Sign Up" : "Sign In" }}
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import { BaseInput, BaseButton } from "@/components/shared/forms";
import {
  validatePassword,
  validateUsername,
  validateLogin,
  validateRegistration,
} from "@/schemas/auth";

// Emits
const emit = defineEmits<{
  close: [];
  success: [type: "login" | "signup"];
  open: [];
}>();

// Clear errors when component is mounted
onMounted(() => {
  emit("open");
  authStore.clearError();
  // Initialize form data
  formData.value = {
    username: "",
    password: "",
    confirmPassword: "",
  };
  // Initialize field errors
  fieldErrors.value = {
    username: "",
    password: "",
    confirmPassword: "",
  };
});

// Props
const props = defineProps<{
  initialMode?: "login" | "signup";
}>();

// Stores
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

// State
const isLoginMode = ref(props.initialMode === "login");
const formData = ref({
  username: "",
  password: "",
  confirmPassword: "",
});

const fieldErrors = ref({
  username: "",
  password: "",
  confirmPassword: "",
});

// Computed
const isLoading = computed(() => authStore.isLoading);
const error = computed(() => authStore.error);

const isFormValid = computed(() => {
  const { username, password, confirmPassword } = formData.value;

  if (isLoginMode.value) {
    const result = validateLogin({ username, password });
    return result.success;
  } else {
    const result = validateRegistration({
      username,
      password,
      confirmPassword,
    });
    return result.success;
  }
});

// Methods
const validateField = (field: keyof typeof formData.value) => {
  const value = formData.value[field];

  switch (field) {
    case "username":
      const usernameValidation = validateUsername(value);
      fieldErrors.value.username = usernameValidation.error || "";
      break;

    case "password":
      if (isLoginMode.value) {
        // For login, just check if password exists
        fieldErrors.value.password = !value ? "Password is required" : "";
      } else {
        // For signup, validate password strength
        const passwordValidation = validatePassword(value);
        fieldErrors.value.password = passwordValidation.errors.join(". ");
      }
      break;

    case "confirmPassword":
      if (!isLoginMode.value) {
        // Use the full registration schema to validate password confirmation
        const result = validateRegistration({
          username: formData.value.username,
          password: formData.value.password,
          confirmPassword: value,
        });

        if (!result.success) {
          const confirmPasswordError = result.error.issues.find((issue) =>
            issue.path.includes("confirmPassword")
          );
          fieldErrors.value.confirmPassword =
            confirmPasswordError?.message || "";
        } else {
          fieldErrors.value.confirmPassword = "";
        }
      }
      break;
  }
};

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
  clearForm();
  authStore.clearError();
};

const clearForm = () => {
  formData.value = {
    username: "",
    password: "",
    confirmPassword: "",
  };
  fieldErrors.value = {
    username: "",
    password: "",
    confirmPassword: "",
  };
};

const handleOverlayClick = () => {
  emit("close");
};

const handleSubmit = async () => {
  // Validate all fields
  validateField("username");
  validateField("password");
  if (!isLoginMode.value) {
    validateField("confirmPassword");
  }

  // Check if form is valid
  if (!isFormValid.value) return;

  try {
    if (isLoginMode.value) {
      await authStore.login({
        username: formData.value.username,
        password: formData.value.password,
      });

      // Emit success first
      emit("success", "login");

      // Then close panel
      emit("close");
    } else {
      await authStore.register({
        username: formData.value.username,
        password: formData.value.password,
      });

      // Emit success first
      emit("success", "signup");

      // Then close panel
      emit("close");
    }
  } catch (err) {
    // Error is handled by the store
    console.error("Authentication failed:", err);
  }
};

// Watchers
watch(
  () => formData.value.username,
  () => validateField("username")
);
watch(
  () => formData.value.password,
  () => {
    validateField("password");
    if (!isLoginMode.value && formData.value.confirmPassword) {
      validateField("confirmPassword");
    }
  }
);
watch(
  () => formData.value.confirmPassword,
  () => validateField("confirmPassword")
);

// Clear errors when switching modes
watch(isLoginMode, () => {
  authStore.clearError();
});
</script>

<style scoped>
.auth-panel-overlay {
  @apply fixed inset-0 flex items-center justify-center p-4;
  background: var(--modal-overlay);
  z-index: var(--z-modal);
}

.auth-panel {
  @apply w-full max-w-sm max-h-[90vh] overflow-y-auto bg-white border-2 border-light-200 rounded-lg shadow-lg;
}

.auth-panel-header {
  @apply flex items-center justify-between p-6 pb-0 mb-4;
}

.auth-panel-title {
  @apply text-xl font-semibold m-0 text-black-900 font-display;
}

.auth-panel-close {
  @apply bg-transparent border-none text-xl cursor-pointer p-1 leading-none transition-all text-gray-500;
}

.auth-panel-close:hover {
  @apply text-black-900;
}

.auth-panel-content {
  @apply px-6 pb-6;
}

.auth-form {
  @apply flex flex-col gap-2;
}

.auth-error {
  @apply p-3 rounded-md text-sm text-center my-4 text-red-500;
  background: var(--error-bg);
  border: 1px solid var(--error-border);
}

.auth-switch {
  @apply mt-6 text-center pt-4;
  border-top: 1px solid var(--border-light);
}

.auth-switch p {
  @apply m-0 text-sm text-gray-500;
}

.auth-switch-btn {
  @apply bg-transparent border-none font-medium cursor-pointer underline text-sm p-0 ml-1 transition-all text-blue-500;
  font-size: inherit;
}

.auth-switch-btn:hover:not(:disabled) {
  @apply text-blue-700;
}

.auth-switch-btn:disabled {
  @apply opacity-60 cursor-not-allowed;
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .auth-panel {
    @apply m-2 max-w-none;
  }

  .auth-panel-header {
    @apply p-4 pb-0;
  }

  .auth-panel-content {
    @apply px-4 pb-4;
  }

  .auth-panel-title {
    @apply text-lg;
  }
}
</style>
