/**
 * FEATURE FLAGS (CONFIG Zone)
 * ─────────────────────────────────────────────────────────────────────────────
 * This file controls application behaviour without touching business logic.
 * These flags are committed to git and are safe to share.
 */

export const features = {
  /** false = auto-verify on signup (useful for dev/testing without email) */
  emailVerification: true,

  /** true = non-admin/super_admin users see maintenance page */
  maintenanceMode: false,

  /** false = disable signup (invite-only mode) */
  registrationOpen: true,

  /** false = hide analytics page from sidebar + block route */
  analyticsEnabled: true,

  // Buyer adds their own feature flags below:
  // paymentsEnabled: false,
  // multiLanguage: false,
} as const;

export type FeatureFlag = keyof typeof features;
