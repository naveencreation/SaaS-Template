"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/config/nav.config";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/Button";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { session } = useSession();

  if (!session) return null;

  const visibleLinks = navLinks.filter((link) =>
    link.roles.includes(session.role)
  );

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}>
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open && (
        <div className="absolute left-0 right-0 top-16 z-50 border-b border-neutral-200 bg-surface-card shadow-lg">
          <nav className="space-y-1 px-3 py-4">
            {visibleLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-md px-3 py-2 text-sm font-medium ${
                    active
                      ? "bg-primary-50 text-primary-700"
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
