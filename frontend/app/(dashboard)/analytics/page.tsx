"use client";

import { useData } from "@/hooks/useData";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { PageError } from "@/components/ui/PageError";
import { TrendingUp, Users, LogIn } from "lucide-react";

interface AnalyticsData {
  signup_trends: { date: string; count: number }[];
  role_distribution: { role: string; count: number }[];
  login_activity: { date: string; count: number }[];
}

export default function AnalyticsPage() {
  const { data, loading, error, refetch } = useData<AnalyticsData>("/api/analytics");

  if (loading) return <PageLayout title="Analytics"><PageSkeleton /></PageLayout>;
  if (error) return <PageLayout title="Analytics"><PageError message={error} onRetry={refetch} /></PageLayout>;
  if (!data) return null;

  const maxSignup = Math.max(...data.signup_trends.map((d) => d.count), 1);
  const maxLogin = Math.max(...data.login_activity.map((d) => d.count), 1);
  const totalUsers = data.role_distribution.reduce((sum, r) => sum + r.count, 0);

  const barColor = (role: string) => {
    const map: Record<string, string> = {
      super_admin: "bg-purple-500",
      admin: "bg-blue-500",
      guest: "bg-green-500",
      user: "bg-yellow-500",
    };
    return map[role] || "bg-gray-500";
  };

  return (
    <PageLayout title="Analytics">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Signup Trends */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Signup Trends (30 days)
          </h3>
          <div className="mt-4 h-48 flex items-end gap-1">
            {data.signup_trends.length === 0 ? (
              <p className="text-sm text-gray-500">No data yet.</p>
            ) : (
              data.signup_trends.map((day) => (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-blue-500"
                    style={{
                      height: `${(day.count / maxSignup) * 100}%`,
                      minHeight: day.count > 0 ? "4px" : "0",
                    }}
                  />
                  <span className="text-[10px] text-gray-500 rotate-45 origin-left">
                    {new Date(day.date).getDate()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Role Distribution */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Users className="h-5 w-5 text-blue-600" />
            Role Distribution
          </h3>
          <div className="mt-4 space-y-3">
            {data.role_distribution.length === 0 ? (
              <p className="text-sm text-gray-500">No data yet.</p>
            ) : (
              data.role_distribution.map((r) => (
                <div key={r.role}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize text-gray-700">{r.role.replace("_", " ")}</span>
                    <span className="font-medium text-gray-900">{r.count}</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
                    <div
                      className={`h-2 rounded-full ${barColor(r.role)}`}
                      style={{ width: `${totalUsers > 0 ? (r.count / totalUsers) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Login Activity */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 lg:col-span-2">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <LogIn className="h-5 w-5 text-blue-600" />
            Login Activity (30 days)
          </h3>
          <div className="mt-4 h-48 flex items-end gap-1">
            {data.login_activity.length === 0 ? (
              <p className="text-sm text-gray-500">No data yet.</p>
            ) : (
              data.login_activity.map((day) => (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-green-500"
                    style={{
                      height: `${(day.count / maxLogin) * 100}%`,
                      minHeight: day.count > 0 ? "4px" : "0",
                    }}
                  />
                  <span className="text-[10px] text-gray-500 rotate-45 origin-left">
                    {new Date(day.date).getDate()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
