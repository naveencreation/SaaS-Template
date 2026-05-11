"use client";

import { Apple, Chrome, Github } from "lucide-react";
import { getEnabledProviders } from "@/config/auth.config";

const ICON_MAP: Record<string, React.ElementType> = {
  google: Chrome,
  github: Github,
  apple: Apple,
  microsoft: MicrosoftIcon,
};

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 21 21"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M1 1h9v9H1z" />
      <path d="M11 1h9v9h-9z" />
      <path d="M1 11h9v9H1z" />
      <path d="M11 11h9v9h-9z" />
    </svg>
  );
}

export function OAuthButtonRow() {
  const providers = getEnabledProviders();
  if (providers.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-surface-card px-2 text-neutral-500">
            Or continue with
          </span>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-3">
        {providers.map((p) => {
          const Icon = ICON_MAP[p.id];
          return (
            <a
              key={p.id}
              href={`/api/auth/oauth/${p.id}`}
              title={p.name}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-surface-card text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
            >
              {Icon ? <Icon className="h-5 w-5" /> : <span className="text-xs font-bold">{p.name[0]}</span>}
            </a>
          );
        })}
      </div>
    </div>
  );
}
