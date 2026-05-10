/**
 * THEME CONFIGURATION (CONFIG Zone)
 * ─────────────────────────────────────────────────────────────────────────────
 * This file is the SINGLE SOURCE OF TRUTH for the application's visual theme.
 * By updating the hex codes here, the entire application will dynamically 
 * recolor itself without needing to edit any React components.
 * 
 * HOW TO SWITCH THEMES:
 * 1. Replace the hex values in the `theme.colors` object.
 * 2. Save the file.
 * 3. The CSS variables will automatically update and inject into the root layout.
 */

export const theme = {
  colors: {
    brand: {
      primary: {
        50: "#eff6ff",
        100: "#dbeafe",
        200: "#bfdbfe",
        300: "#93c5fd",
        400: "#60a5fa",
        500: "#3b82f6",
        600: "#2563eb",
        700: "#1d4ed8",
        800: "#1e40af",
        900: "#1e3a8a",
        950: "#172554",
      },
      secondary: {
        50: "#eef2ff",
        100: "#e0e7ff",
        200: "#c7d2fe",
        300: "#a5b4fc",
        400: "#818cf8",
        500: "#6366f1",
        600: "#4f46e5",
        700: "#4338ca",
        800: "#3730a3",
        900: "#312e81",
        950: "#1e1b4b",
      },
    },
  },
} as const;

/**
 * FLAT CSS VARIABLES
 * ─────────────────────────────────────────────────────────────────────────────
 * This object maps the nested TypeScript theme object above into flat CSS 
 * variables that can be injected into the `:root` DOM element and read by 
 * Tailwind CSS.
 * 
 * DO NOT use these directly in your code. Use Tailwind classes like 
 * `bg-primary-600` instead.
 */
export const cssVariables = {
  "--color-primary-50": theme.colors.brand.primary[50],
  "--color-primary-100": theme.colors.brand.primary[100],
  "--color-primary-200": theme.colors.brand.primary[200],
  "--color-primary-300": theme.colors.brand.primary[300],
  "--color-primary-400": theme.colors.brand.primary[400],
  "--color-primary-500": theme.colors.brand.primary[500],
  "--color-primary-600": theme.colors.brand.primary[600],
  "--color-primary-700": theme.colors.brand.primary[700],
  "--color-primary-800": theme.colors.brand.primary[800],
  "--color-primary-900": theme.colors.brand.primary[900],
  "--color-primary-950": theme.colors.brand.primary[950],

  "--color-secondary-50": theme.colors.brand.secondary[50],
  "--color-secondary-100": theme.colors.brand.secondary[100],
  "--color-secondary-200": theme.colors.brand.secondary[200],
  "--color-secondary-300": theme.colors.brand.secondary[300],
  "--color-secondary-400": theme.colors.brand.secondary[400],
  "--color-secondary-500": theme.colors.brand.secondary[500],
  "--color-secondary-600": theme.colors.brand.secondary[600],
  "--color-secondary-700": theme.colors.brand.secondary[700],
  "--color-secondary-800": theme.colors.brand.secondary[800],
  "--color-secondary-900": theme.colors.brand.secondary[900],
  "--color-secondary-950": theme.colors.brand.secondary[950],
};
