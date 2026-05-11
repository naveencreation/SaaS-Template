import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-neutral-200 bg-surface-card p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
