/**
 * Validates frontend config files at startup.
 * Logs warnings for misconfigured routes, missing nav links, etc.
 */

import { routePermissions } from "@/config/roles.config";
import { navLinks } from "@/config/nav.config";
import { Role } from "@/config/roles.config";

const validRoles: Role[] = ["guest", "user", "admin", "super_admin"];

export function validateConfigs(): void {
  const warnings: string[] = [];

  // Check routePermissions for invalid roles
  for (const [route, roles] of Object.entries(routePermissions)) {
    for (const role of roles) {
      if (!validRoles.includes(role)) {
        warnings.push(`Invalid role "${role}" in routePermissions for "${route}"`);
      }
    }
  }

  // Check navLinks for routes not in routePermissions
  for (const link of navLinks) {
    if (!routePermissions[link.href] && !link.href.startsWith("/dashboard/")) {
      warnings.push(`Nav link "${link.href}" has no entry in routePermissions`);
    }
  }

  // Check navLinks for invalid roles
  for (const link of navLinks) {
    for (const role of link.roles) {
      if (!validRoles.includes(role)) {
        warnings.push(`Invalid role "${role}" in navLinks for "${link.href}"`);
      }
    }
  }

  if (warnings.length > 0) {
    console.warn("[config-validator] Configuration warnings:");
    warnings.forEach((w) => console.warn(`  - ${w}`));
  }
}
