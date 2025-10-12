import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{vue,ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Custom color palette
        "white-000": "#ffffff",
        "light-100": "#f4f7fb",
        "light-200": "#e0e9f4",
        "grey-300": "#b9c9db",
        "grey-400": "#708ca6",
        "dark-700": "#39545e",
        "dark-800": "#28383e",
        "black-900": "#07151d",

        // Functional colors using CSS variables
        background: "var(--background)",
        "background-secondary": "var(--background-secondary)",
        "background-tertiary": "var(--background-tertiary)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary": "var(--text-tertiary)",
        border: "var(--border)",
        "border-light": "var(--border-light)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "error-red": "var(--error-red)",
      },
      fontFamily: {
        primary: ["var(--font-primary)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
      },
      spacing: {
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        "2xl": "var(--spacing-2xl)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      transitionTimingFunction: {
        fast: "var(--transition-fast)",
        normal: "var(--transition-normal)",
        slow: "var(--transition-slow)",
      },
    },
  },
  plugins: [],
  safelist: [
    // Add any classes that might be dynamically generated
    "bg-theme-primary",
    "bg-theme-secondary",
    "bg-theme-tertiary",
    "bg-theme-accent",
    "text-theme-primary",
    "text-theme-secondary",
    "text-theme-tertiary",
    "text-theme-white",
    "text-theme-accent",
    "text-theme-error",
    "border-theme-primary",
    "border-theme-light",
    "border-theme-accent",
    "border-theme-error",
    "rounded-theme-lg",
    "shadow-theme-lg",
    "font-theme-display",
    "font-theme-semibold",
    "transition-theme-fast",
  ],
} satisfies Config;
