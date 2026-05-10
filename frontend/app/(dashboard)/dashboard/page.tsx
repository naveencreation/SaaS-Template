"use client";

import { PageLayout } from "@/components/ui/PageLayout";

export default function DashboardHome() {
  return (
    <PageLayout title="Dashboard">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Total Users", value: "—" },
          { label: "Active Users", value: "—" },
          { label: "New This Week", value: "—" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-gray-200 bg-white p-6"
          >
            <p className="text-sm font-medium text-gray-600">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Recent Activity
        </h3>
        <p className="mt-2 text-gray-500">
          Real-time widgets will appear here in Phase 6.
        </p>
      </div>
    </PageLayout>
  );
}
