import { ReactNode } from "react";
import Link from "next/link";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="border-b border-neutral-200 bg-surface-card px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-xl font-bold text-neutral-900">
            SaaS Template
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-neutral-700 hover:text-neutral-900"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-neutral-200 bg-surface-background px-6 py-8 text-center text-sm text-neutral-500">
        &copy; {new Date().getFullYear()} SaaS Template. All rights reserved.
      </footer>
    </div>
  );
}
