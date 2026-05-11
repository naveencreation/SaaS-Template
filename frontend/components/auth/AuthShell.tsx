"use client";

import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";
import { branding } from "@/config/branding.config";
import { ReactNode } from "react";

const ICON_MAP: Record<string, React.ElementType> = {
  Zap,
};

function BrandPanel() {
  const pathname = usePathname();
  const isSignup = pathname === "/signup";

  const headline = isSignup
    ? branding.auth.signupHeadline
    : branding.auth.loginHeadline;
  const subTagline = isSignup
    ? branding.auth.signupSubTagline
    : branding.auth.loginSubTagline;

  const Icon = ICON_MAP[branding.logoIcon] ?? Zap;

  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-surface-auth-panel p-10 md:flex md:w-1/2">
      {/* subtle radial glow */}
      <div
        className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, var(--color-primary-500) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-semibold text-neutral-900">
          {branding.appName}
        </span>
      </div>

      <div className="relative z-10">
        <h1 className="text-5xl font-extrabold tracking-tight text-neutral-900">
          {headline[0]}
          <span
            className="block bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(90deg, var(--color-auth-gradient-from), var(--color-auth-gradient-to))",
            }}
          >
            {headline[1]}
          </span>
        </h1>
        <p className="mt-6 max-w-xs whitespace-pre-line text-base leading-relaxed text-neutral-600">
          {subTagline}
        </p>
      </div>

      <div className="relative z-10 text-xs text-neutral-400">
        &copy; {new Date().getFullYear()} {branding.appName}. All rights reserved.
      </div>
    </div>
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-surface-background px-4 py-8">
      {/* soft radial glow in background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, var(--color-primary-200) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-5xl overflow-hidden rounded-2xl border border-neutral-200 bg-surface-card shadow-2xl">
        <BrandPanel />
        <div className="flex w-full flex-col justify-center p-8 md:w-1/2 md:p-12">
          {children}
        </div>
      </div>
    </div>
  );
}
