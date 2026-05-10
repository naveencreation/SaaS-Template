/**
 * OAuth provider configuration.
 * Reads from environment variables (NEXT_PUBLIC_* flags).
 * These are committed to git and safe to share.
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
