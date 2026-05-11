"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  onClick,
  className = "",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
    secondary:
      "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-neutral-500",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost:
      "text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
