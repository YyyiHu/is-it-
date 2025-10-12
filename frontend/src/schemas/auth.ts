import { z } from "zod";

// Password validation schema with strong requirements
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    "Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)"
  )
  .max(50, "Password must be less than 50 characters");

// Username validation schema
export const usernameSchema = z
  .string()
  .min(1, "Username is required")
  .min(3, "Username must be at least 3 characters long")
  .max(50, "Username must be less than 50 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, underscores, and hyphens"
  )
  .trim();

// Login schema (password requirements are relaxed for existing users)
export const loginSchema = z.object({
  username: usernameSchema,
  password: z
    .string()
    .min(1, "Password is required")
    .max(50, "Password is too long"),
});

// Registration schema (strict password requirements)
export const registrationSchema = z
  .object({
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// User settings schema
export const userSettingsSchema = z.object({
  auto_reload_enabled: z.boolean(),
  auto_reload_interval_minutes: z
    .number()
    .min(1, "Interval must be at least 1 minute")
    .max(60, "Interval must be at most 60 minutes"),
});

// Type exports
export type LoginData = z.infer<typeof loginSchema>;
export type RegistrationData = z.infer<typeof registrationSchema>;
export type UserSettingsData = z.infer<typeof userSettingsSchema>;

// Validation helper functions
export const validateLogin = (data: unknown) => {
  return loginSchema.safeParse(data);
};

export const validateRegistration = (data: unknown) => {
  return registrationSchema.safeParse(data);
};

export const validateUserSettings = (data: unknown) => {
  return userSettingsSchema.safeParse(data);
};

// Individual field validation helpers
export const validateUsername = (username: string) => {
  const result = usernameSchema.safeParse(username);
  return {
    isValid: result.success,
    error: result.success ? undefined : result.error.issues[0]?.message,
  };
};

export const validatePassword = (password: string) => {
  const result = passwordSchema.safeParse(password);
  return {
    isValid: result.success,
    errors: result.success
      ? []
      : result.error.issues.map((issue) => issue.message),
    requirements: {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
  };
};
