import { NextRequest } from "next/server";
import { Role } from "@/config/roles.config";

export interface Session {
  user_id: string;
  email: string;
  role: Role;
  full_name: string;
  exp: number;
}

/**
 * Decodes a JWT payload WITHOUT verifying the signature.
 * Safe for client-side use because we never trust the payload alone —
 * FastAPI always re-verifies the signature server-side.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Reads the access_token cookie from the request and extracts session info.
 * Returns null if no cookie or invalid format.
 */
export function getSessionFromCookie(req: NextRequest): Session | null {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const role = payload.role as Role;
  if (!role) return null;

  return {
    user_id: (payload.sub as string) || "",
    email: (payload.email as string) || "",
    role,
    full_name: (payload.full_name as string) || "",
    exp: (payload.exp as number) || 0,
  };
}

/**
 * Checks if the session is expired (with a 60-second buffer).
 */
export function isSessionExpired(session: Session): boolean {
  const now = Math.floor(Date.now() / 1000);
  return session.exp < now + 60;
}
