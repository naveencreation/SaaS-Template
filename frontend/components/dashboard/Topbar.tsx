"use client";

import { useRouter } from "next/navigation";
import { LogOut, UserCircle } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/Button";

export function Topbar() {
  const router = useRouter();
  const { session } = useSession();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/login");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h2 className="text-lg font-semibold text-gray-900">
        SaaS Template
      </h2>
      <div className="flex items-center gap-4">
        {session && (
          <>
            <div className="flex items-center gap-2">
              <UserCircle className="h-6 w-6 text-gray-400" />
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {session.full_name}
                </p>
                <p className="text-xs capitalize text-gray-500">
                  {session.role.replace("_", " ")}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
