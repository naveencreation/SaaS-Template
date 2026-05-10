"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  BarChart3,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { navLinks } from "@/config/nav.config";
import { useSession } from "@/hooks/useSession";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  User,
  BarChart3,
  Users,
  Settings,
};

export function Sidebar() {
  const pathname = usePathname();
  const { session, loading } = useSession();

  if (loading || !session) return null;

  const visibleLinks = navLinks.filter((link) =>
    link.roles.includes(session.role)
  );

  return (
    <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white md:flex">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <span className="text-lg font-bold text-gray-900">SaaS Template</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleLinks.map((link) => {
          const Icon = iconMap[link.icon ?? "LayoutDashboard"];
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {Icon && <Icon className="mr-3 h-5 w-5" />}
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
