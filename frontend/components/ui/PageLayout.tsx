"use client";

import { ReactNode } from "react";

interface PageLayoutProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

export function PageLayout({ title, children, action }: PageLayoutProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {action && <div>{action}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}
