import { Role } from "./roles.config";

export interface NavLink {
  label: string;
  href: string;
  icon?: string; // Lucide icon name
  roles: Role[];
}

/**
 * Sidebar navigation links.
 * Routes are filtered by the user's role in the Sidebar component.
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
