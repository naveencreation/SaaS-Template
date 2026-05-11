/**
 * BRANDING CONFIGURATION (CONFIG Zone)
 * ─────────────────────────────────────────────────────────────────────────────
 * One file to rebrand the entire auth experience.
 * Edit these values and the login/signup screens update automatically.
 */

export const branding = {
  appName: "SaaS Template",
  logoIcon: "Zap" as const, // lucide-react icon name used in auth left panel

  auth: {
    loginHeadline: ["Speak it.", "Know it."] as [string, string],
    loginSubTagline:
      "AI transcription that runs on your device.\nPrivate. Fast. Accurate.",

    signupHeadline: ["Record.", "Understand."] as [string, string],
    signupSubTagline:
      "Turn any audio into insights.\nFree forever. No credit card.",
  },
};
