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
 *
 * TOKEN REFERENCE:
 * ─ primary / secondary      -> Brand identity (buttons, links, active states)
 * ─ neutral                  -> Text, borders, backgrounds, inactive states
 * ─ semantic (success/error/warning/info) -> Status badges, error messages
 * ─ surface                  -> Page backgrounds, card backgrounds
 * ─ decorative               -> Landing page feature card accents only
 * ─ spacing / radius / shadow / typography -> Semantic design tokens
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
    neutral: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
      950: "#030712",
    },
    semantic: {
      success: {
        bg: "#dcfce7",
        text: "#15803d",
        border: "#bbf7d0",
        solid: "#22c55e",
      },
      error: {
        bg: "#fee2e2",
        text: "#b91c1c",
        border: "#fecaca",
        solid: "#ef4444",
      },
      warning: {
        bg: "#fef3c7",
        text: "#92400e",
        border: "#fde68a",
        solid: "#eab308",
      },
      info: {
        bg: "#dbeafe",
        text: "#1d4ed8",
        border: "#bfdbfe",
        solid: "#3b82f6",
      },
    },
    surface: {
      background: "#f9fafb",
      card: "#ffffff",
      inverse: "#111827",
      authPanel: "#f3f4f6",
    },
    auth: {
      gradient: {
        from: "#2563eb",
        to: "#6366f1",
      },
    },
    decorative: {
      blue: { text: "#2563eb", bg: "#eff6ff" },
      indigo: { text: "#4f46e5", bg: "#eef2ff" },
      purple: { text: "#9333ea", bg: "#faf5ff" },
      amber: { text: "#d97706", bg: "#fffbeb" },
      teal: { text: "#0d9488", bg: "#f0fdfa" },
      rose: { text: "#e11d48", bg: "#fff1f2" },
    },
  },
  spacing: {
    card: { padding: "p-6", gap: "space-y-4" },
    page: { gap: "space-y-6", padding: "p-6" },
    form: { gap: "space-y-4" },
    inline: { gap: "gap-2", gapMd: "gap-4" },
  },
  radius: {
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    pill: "rounded-full",
  },
  shadow: {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-2xl",
  },
  typography: {
    pageTitle: "text-2xl font-bold",
    sectionTitle: "text-lg font-semibold",
    cardTitle: "text-lg font-semibold",
    body: "text-sm",
    bodyLg: "text-base",
    caption: "text-xs",
    metric: "text-3xl font-bold",
    hero: "text-5xl font-extrabold tracking-tight",
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
 * `bg-primary-600` or `bg-neutral-100` instead.
 */
export const cssVariables = {
  // ── Brand primary ──
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

  // ── Brand secondary ──
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

  // ── Neutral ──
  "--color-neutral-50": theme.colors.neutral[50],
  "--color-neutral-100": theme.colors.neutral[100],
  "--color-neutral-200": theme.colors.neutral[200],
  "--color-neutral-300": theme.colors.neutral[300],
  "--color-neutral-400": theme.colors.neutral[400],
  "--color-neutral-500": theme.colors.neutral[500],
  "--color-neutral-600": theme.colors.neutral[600],
  "--color-neutral-700": theme.colors.neutral[700],
  "--color-neutral-800": theme.colors.neutral[800],
  "--color-neutral-900": theme.colors.neutral[900],
  "--color-neutral-950": theme.colors.neutral[950],

  // ── Semantic: success ──
  "--color-success-bg": theme.colors.semantic.success.bg,
  "--color-success-text": theme.colors.semantic.success.text,
  "--color-success-border": theme.colors.semantic.success.border,
  "--color-success-solid": theme.colors.semantic.success.solid,

  // ── Semantic: error ──
  "--color-error-bg": theme.colors.semantic.error.bg,
  "--color-error-text": theme.colors.semantic.error.text,
  "--color-error-border": theme.colors.semantic.error.border,
  "--color-error-solid": theme.colors.semantic.error.solid,

  // ── Semantic: warning ──
  "--color-warning-bg": theme.colors.semantic.warning.bg,
  "--color-warning-text": theme.colors.semantic.warning.text,
  "--color-warning-border": theme.colors.semantic.warning.border,
  "--color-warning-solid": theme.colors.semantic.warning.solid,

  // ── Semantic: info ──
  "--color-info-bg": theme.colors.semantic.info.bg,
  "--color-info-text": theme.colors.semantic.info.text,
  "--color-info-border": theme.colors.semantic.info.border,
  "--color-info-solid": theme.colors.semantic.info.solid,

  // ── Surface ──
  "--color-surface-background": theme.colors.surface.background,
  "--color-surface-card": theme.colors.surface.card,
  "--color-surface-inverse": theme.colors.surface.inverse,
  "--color-surface-auth-panel": theme.colors.surface.authPanel,

  // ── Auth gradient ──
  "--color-auth-gradient-from": theme.colors.auth.gradient.from,
  "--color-auth-gradient-to": theme.colors.auth.gradient.to,

  // ── Decorative (landing page only) ──
  "--color-decorative-blue-text": theme.colors.decorative.blue.text,
  "--color-decorative-blue-bg": theme.colors.decorative.blue.bg,
  "--color-decorative-indigo-text": theme.colors.decorative.indigo.text,
  "--color-decorative-indigo-bg": theme.colors.decorative.indigo.bg,
  "--color-decorative-purple-text": theme.colors.decorative.purple.text,
  "--color-decorative-purple-bg": theme.colors.decorative.purple.bg,
  "--color-decorative-amber-text": theme.colors.decorative.amber.text,
  "--color-decorative-amber-bg": theme.colors.decorative.amber.bg,
  "--color-decorative-teal-text": theme.colors.decorative.teal.text,
  "--color-decorative-teal-bg": theme.colors.decorative.teal.bg,
  "--color-decorative-rose-text": theme.colors.decorative.rose.text,
  "--color-decorative-rose-bg": theme.colors.decorative.rose.bg,
};
