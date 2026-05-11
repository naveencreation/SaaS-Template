"use client";

import { Button } from "./Button";

interface PageErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function PageError({
  message = "Failed to load data.",
  onRetry,
}: PageErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-error-border bg-error-bg p-8 text-center">
      <p className="text-lg font-medium text-error-text">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
