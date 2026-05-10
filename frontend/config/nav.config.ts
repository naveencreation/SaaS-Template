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
    href: "/dashboard/profile",
    icon: "User",
    roles: ["user", "admin", "super_admin"],
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: "BarChart3",
    roles: ["user", "admin", "super_admin"],
  },
  {
    label: "User Management",
    href: "/dashboard/user-management",
    icon: "Users",
    roles: ["admin", "super_admin"],
  },
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: "Bell",
    roles: ["user", "admin", "super_admin"],
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: "Settings",
    roles: ["super_admin"],
  },
];
