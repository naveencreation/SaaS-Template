"use client";

import { ReactNode } from "react";
import { Role } from "@/config/roles.config";
import { useSession } from "@/hooks/useSession";

interface CanAccessProps {
  roles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Role-based visibility wrapper.
 * Only renders children when the current user's role is in the allowed list.
 * Does NOT provide security — only hides UI. Real security is enforced by FastAPI.
 */
export function CanAccess({
  roles,
  children,
  fallback = null,
}: CanAccessProps) {
  const { session, loading } = useSession();

  if (loading) return null;
  if (!session) return fallback;
  if (!roles.includes(session.role)) return fallback;

  return <>{children}</>;
}
