"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { MobileMenu } from "@/components/dashboard/MobileMenu";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
      <div className="fixed left-4 top-4 z-50 md:hidden">
        <MobileMenu />
      </div>
    </div>
  );
}
