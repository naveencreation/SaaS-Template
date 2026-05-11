"use client";

export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-neutral-200" />
      <div className="space-y-4">
        <div className="h-4 w-full rounded bg-neutral-200" />
        <div className="h-4 w-5/6 rounded bg-neutral-200" />
        <div className="h-4 w-4/6 rounded bg-neutral-200" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-neutral-200" />
        ))}
      </div>
    </div>
  );
}
