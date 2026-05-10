"use client";

import { useData } from "@/hooks/useData";
import { useSession } from "@/hooks/useSession";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { PageError } from "@/components/ui/PageError";
import { Activity, Users, UserCheck, UserPlus, Server } from "lucide-react";

interface Stats {
  total_users: number;
  active_users: number;
  new_this_week: number;
  recent_activity: {
    action: string;
    user_email: string | null;
    created_at: string;
  }[];
  system_status: { db: string; redis: string };
}

const statCards = [
  { key: "total_users" as const, label: "Total Users", icon: Users },
  { key: "active_users" as const, label: "Active Users", icon: UserCheck },
  { key: "new_this_week" as const, label: "New This Week", icon: UserPlus },
];

export default function DashboardHome() {
  const { session } = useSession();
  const isAdmin = session?.user?.role === "admin" || session?.user?.role === "super_admin";

  const { data: stats, loading, error, refetch } = useData<Stats>(
    isAdmin ? "/api/dashboard/stats" : null
  );

  if (loading) return <PageLayout title="Dashboard"><PageSkeleton /></PageLayout>;
  if (error) return <PageLayout title="Dashboard"><PageError message={error} onRetry={refetch} /></PageLayout>;

  if (!isAdmin) {
    return (
      <PageLayout title="Dashboard">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Welcome back, {session?.user?.full_name}!
          </h2>
          <p className="mt-2 text-gray-600">
            Select an option from the sidebar to get started.
          </p>
        </div>
      </PageLayout>
    );
  }

  if (!stats) return null;

  return (
    <PageLayout title="Dashboard">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map(({ key, label, icon: Icon }) => (
          <div
            key={key}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats[key]}
                </p>
              </div>
              <div className="rounded-full bg-blue-50 p-3">
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System status */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Server className="h-5 w-5" />
            System Status
          </h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  stats.system_status.db === "ok"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {stats.system_status.db === "ok" ? "Healthy" : "Error"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Redis</span>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  stats.system_status.redis === "ok"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {stats.system_status.redis === "ok" ? "Healthy" : "Error"}
              </span>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Activity className="h-5 w-5" />
            Recent Activity
          </h3>
          <div className="mt-4 space-y-3">
            {stats.recent_activity.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity.</p>
            ) : (
              stats.recent_activity.map((act, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {act.action.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {act.user_email || "System"} · {new Date(act.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

