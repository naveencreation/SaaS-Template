"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-neutral-900">500</h1>
        <p className="mt-4 text-xl text-neutral-600">Something went wrong.</p>
        <button
          onClick={reset}
          className="mt-8 inline-block rounded-md bg-primary-600 px-6 py-3 text-white hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
