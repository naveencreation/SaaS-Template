import { Role } from "./roles.config";

export interface NavLink {
  label: string;
  href: string;
  icon?: string; // Lucide icon name
  roles: Role[];
}

/**
 * NAVIGATION CONFIGURATION (CONFIG Zone)
 * ─────────────────────────────────────────────────────────────────────────────
 * This file defines the sidebar links.
 * 
 * TO ADD A NEW LINK:
 * 1. Add a new object to the `navLinks` array.
 * 2. Specify the label, href, icon (Lucide name), and allowed roles.
 * 
 * Note: Sidebar component automatically filters links based on user role.
 */
export const navLinks: NavLink[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    roles: ["guest", "user", "admin", "super_admin"],
  },
  {
    label: "Profile",
    href: "/profile",
    icon: "User",
    roles: ["user", "admin", "super_admin"],
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: "BarChart3",
    roles: ["user", "admin", "super_admin"],
  },
  {
    label: "User Management",
    href: "/user-management",
    icon: "Users",
    roles: ["admin", "super_admin"],
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: "Bell",
    roles: ["user", "admin", "super_admin"],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: "Settings",
    roles: ["super_admin"],
  },
  // ── Buyer feature example (copy + uncomment to add a page) ──
  // {
  //   label: "Examples",
  //   href: "/business/examples",
  //   icon: "Box",
  //   roles: ["user", "admin", "super_admin"],
  // },
];
