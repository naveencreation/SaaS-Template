import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
          950: "var(--color-primary-950)",
        },
        secondary: {
          50: "var(--color-secondary-50)",
          100: "var(--color-secondary-100)",
          200: "var(--color-secondary-200)",
          300: "var(--color-secondary-300)",
          400: "var(--color-secondary-400)",
          500: "var(--color-secondary-500)",
          600: "var(--color-secondary-600)",
          700: "var(--color-secondary-700)",
          800: "var(--color-secondary-800)",
          900: "var(--color-secondary-900)",
          950: "var(--color-secondary-950)",
        },
        neutral: {
          50: "var(--color-neutral-50)",
          100: "var(--color-neutral-100)",
          200: "var(--color-neutral-200)",
          300: "var(--color-neutral-300)",
          400: "var(--color-neutral-400)",
          500: "var(--color-neutral-500)",
          600: "var(--color-neutral-600)",
          700: "var(--color-neutral-700)",
          800: "var(--color-neutral-800)",
          900: "var(--color-neutral-900)",
          950: "var(--color-neutral-950)",
        },
        success: {
          bg: "var(--color-success-bg)",
          text: "var(--color-success-text)",
          border: "var(--color-success-border)",
          solid: "var(--color-success-solid)",
        },
        error: {
          bg: "var(--color-error-bg)",
          text: "var(--color-error-text)",
          border: "var(--color-error-border)",
          solid: "var(--color-error-solid)",
        },
        warning: {
          bg: "var(--color-warning-bg)",
          text: "var(--color-warning-text)",
          border: "var(--color-warning-border)",
          solid: "var(--color-warning-solid)",
        },
        info: {
          bg: "var(--color-info-bg)",
          text: "var(--color-info-text)",
          border: "var(--color-info-border)",
          solid: "var(--color-info-solid)",
        },
        surface: {
          background: "var(--color-surface-background)",
          card: "var(--color-surface-card)",
          inverse: "var(--color-surface-inverse)",
        },
        decorative: {
          blue: { text: "var(--color-decorative-blue-text)", bg: "var(--color-decorative-blue-bg)" },
          indigo: { text: "var(--color-decorative-indigo-text)", bg: "var(--color-decorative-indigo-bg)" },
          purple: { text: "var(--color-decorative-purple-text)", bg: "var(--color-decorative-purple-bg)" },
          amber: { text: "var(--color-decorative-amber-text)", bg: "var(--color-decorative-amber-bg)" },
          teal: { text: "var(--color-decorative-teal-text)", bg: "var(--color-decorative-teal-bg)" },
          rose: { text: "var(--color-decorative-rose-text)", bg: "var(--color-decorative-rose-bg)" },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "gradient-x": "gradientX 10s ease infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        gradientX: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
