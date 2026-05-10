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
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 text-center">
      <p className="text-lg font-medium text-red-800">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
