/**
 * ROLE CONFIGURATION (CONFIG Zone)
 * ─────────────────────────────────────────────────────────────────────────────
 * This file defines the route permission map.
 * 
 * TO ADD A NEW PROTECTED ROUTE:
 * 1. Add the route path as a key in `routePermissions`.
 * 2. Add the roles allowed to access it in the array.
 * 
 * Example:
 *   "/business/my-feature": ["user", "admin", "super_admin"]
 * 
 * Note: Middleware uses this map to redirect unauthorized users to /unauthorized.
 */

export type Role = "guest" | "user" | "admin" | "super_admin";

export const routePermissions: Record<string, Role[]> = {
  // Public routes — no role required
  "/": ["guest", "user", "admin", "super_admin"],
  "/login": ["guest", "user", "admin", "super_admin"],
  "/signup": ["guest", "user", "admin", "super_admin"],
  "/forgot-password": ["guest", "user", "admin", "super_admin"],
  "/reset-password": ["guest", "user", "admin", "super_admin"],
  "/verify-email": ["guest", "user", "admin", "super_admin"],
  "/link-account": ["guest", "user", "admin", "super_admin"],
  "/unauthorized": ["guest", "user", "admin", "super_admin"],
  "/maintenance": ["guest", "user", "admin", "super_admin"],

  // Dashboard — all authenticated users
  "/dashboard": ["guest", "user", "admin", "super_admin"],
  "/profile": ["user", "admin", "super_admin"], // guests can't edit profile
  "/notifications": ["user", "admin", "super_admin"],

  // Business pages — standard users and up
  "/analytics": ["user", "admin", "super_admin"],

  // Management — admin and super_admin only
  "/user-management": ["admin", "super_admin"],

  // System — super_admin only
  "/settings": ["super_admin"],

  // ── Buyer feature example (copy + uncomment) ──
  // "/business/examples": ["user", "admin", "super_admin"],
};

/**
 * Check if a role is allowed on a given route.
 * Route matching: exact match first, then prefix match (e.g. /dashboard/*)
 */
export function isRouteAllowed(path: string, role: Role): boolean {
  // Exact match
  if (routePermissions[path]) {
    return routePermissions[path].includes(role);
  }

  // Prefix match — find the most specific prefix
  const sortedPrefixes = Object.keys(routePermissions)
    .filter((r) => path.startsWith(r))
    .sort((a, b) => b.length - a.length);

  if (sortedPrefixes.length > 0) {
    return routePermissions[sortedPrefixes[0]].includes(role);
  }

  // Default: deny if no matching route
  return false;
}
