"use client";

/**
 * EXAMPLE PAGE — Template for buyer dashboard pages.
 *
 * Copy this file to: frontend/app/(dashboard)/business/<your-feature>/page.tsx
 * Add proxy route: frontend/app/api/business/<your-feature>/route.ts
 * Add nav link: frontend/config/nav.config.ts
 * Add route permission: frontend/config/roles.config.ts
 *
 * No edits to main.py needed — backend router auto-discovered.
 */

import { useData } from "@/hooks/useData";
import { useMutation } from "@/hooks/useMutation";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { PageError } from "@/components/ui/PageError";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface MyFeatureItem {
  id: string;
  name: string;
  description: string | null;
}

export default function MyFeaturePage() {
  const { data, loading, error, refetch } = useData<{
    items: MyFeatureItem[];
    total: number;
  }>("/api/business/my-feature");

  const { mutate: createItem } = useMutation<MyFeatureItem>(
    "/api/business/my-feature",
    "POST"
  );

  if (loading) return <PageLayout title="My Feature"><PageSkeleton /></PageLayout>;
  if (error) return <PageLayout title="My Feature"><PageError message={error} onRetry={refetch} /></PageLayout>;

  return (
    <PageLayout title="My Feature">
      <p className="text-gray-600">Total items: {data?.total ?? 0}</p>
      {/* Add your UI here */}
    </PageLayout>
  );
}
