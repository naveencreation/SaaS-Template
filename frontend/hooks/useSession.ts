"use client";

import { useState, useEffect } from "react";
import { Role } from "@/config/roles.config";

interface Session {
  user_id: string;
  email: string;
  role: Role;
  full_name: string;
}

interface UseSessionResult {
  session: Session | null;
  loading: boolean;
}

/**
 * Client-side session hook.
 * Fetches /api/auth/me to get current user info.
 * Returns null if not authenticated.
 */
export function useSession(): UseSessionResult {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const json = await res.json();
        if (json.success && json.user) {
          setSession({
            user_id: json.user.id,
            email: json.user.email,
            role: json.user.role as Role,
            full_name: json.user.full_name,
          });
        } else {
          setSession(null);
        }
      } catch {
        setSession(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, []);

  return { session, loading };
}
