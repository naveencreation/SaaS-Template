"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { Bell, ShieldCheck, AlertCircle } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success";
  created_at: string;
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, use mock data. In production, fetch from /api/notifications
    setTimeout(() => {
      setNotifications([
        {
          id: "1",
          title: "Welcome to SaaS Template",
          message: "Your account is set up and ready to go.",
          type: "success",
          created_at: new Date().toISOString(),
          read: false,
        },
        {
          id: "2",
          title: "Security Tip",
          message: "Enable two-factor authentication for extra security.",
          type: "info",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          read: false,
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const iconMap = {
    info: <Bell className="h-5 w-5 text-primary-500" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    success: <ShieldCheck className="h-5 w-5 text-green-500" />,
  };

  if (loading) return <PageLayout title="Notifications"><PageSkeleton /></PageLayout>;

  return (
    <PageLayout title="Notifications">
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-500">No notifications yet.</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 rounded-lg border p-4 ${
                n.read ? "border-gray-200 bg-white" : "border-primary-200 bg-primary-50"
              }`}
            >
              <div className="mt-0.5">{iconMap[n.type]}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-600">{n.message}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </PageLayout>
  );
}
