/**
 * OAUTH CONFIGURATION (CONFIG Zone)
 * ─────────────────────────────────────────────────────────────────────────────
 * This file defines which OAuth providers are available in the UI.
 * Visibility is controlled by the NEXT_PUBLIC_* environment variables.
 * 
 * To enable a provider:
 * 1. Set GOOGLE_AUTH_ENABLED=true in .env
 * 2. Ensure Google client ID and secret are set in .env
 */

export interface OAuthProvider {
  id: string;
  name: string;
  enabled: boolean;
}

export const oauthProviders: OAuthProvider[] = [
  {
    id: "google",
    name: "Google",
    enabled: process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true",
  },
  {
    id: "github",
    name: "GitHub",
    enabled: process.env.NEXT_PUBLIC_GITHUB_AUTH_ENABLED === "true",
  },
  {
    id: "microsoft",
    name: "Microsoft",
    enabled: process.env.NEXT_PUBLIC_MICROSOFT_AUTH_ENABLED === "true",
  },
];

/** Returns only the enabled providers for rendering login/signup OAuth buttons. */
export function getEnabledProviders(): OAuthProvider[] {
  return oauthProviders.filter((p) => p.enabled);
}
