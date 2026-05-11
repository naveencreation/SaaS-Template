"use client";

/**
 * EXAMPLE PAGE — Template for buyer dashboard pages.
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * TO ADD A NEW PAGE:
 * 1. Copy this file to: frontend/app/(dashboard)/business/<feature>/page.tsx
 * 2. Add a proxy route: frontend/app/api/business/<feature>/route.ts (Copy _example-route.ts)
 * 3. Add sidebar link: frontend/config/nav.config.ts
 * 4. Add permission: frontend/config/roles.config.ts
 */

import { useData } from "@/hooks/useData";
import { useMutation } from "@/hooks/useMutation";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { PageError } from "@/components/ui/PageError";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Plus } from "lucide-react";

interface MyItem {
  id: string;
  name: string;
  description: string | null;
}

export default function MyFeaturePage() {
  // 1. Fetch data using the standard hook
  const { data, loading, error, refetch } = useData<{
    items: MyItem[];
    total: number;
  }>("/api/business/my-feature");

  // 2. Setup mutations for create/update/delete
  const { mutate: createItem, loading: creating } = useMutation<MyItem>(
    "/api/business/my-feature",
    "POST"
  );

  // 3. Handle loading and error states consistently
  if (loading) return <PageLayout title="My Feature"><PageSkeleton /></PageLayout>;
  if (error) return <PageLayout title="My Feature"><PageError message={error} onRetry={refetch} /></PageLayout>;

  const handleAdd = async () => {
    const success = await createItem({ name: "New Item", description: "Added via example" });
    if (success) refetch(); // Reload list after create
  };

  return (
    <PageLayout 
      title="My Feature"
      actions={
        <Button onClick={handleAdd} loading={creating}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data?.items.length === 0 ? (
          <p className="text-neutral-500">No items found. Click "Add Item" to start.</p>
        ) : (
          data?.items.map((item) => (
            <Card key={item.id} className="p-4">
              <h3 className="font-bold">{item.name}</h3>
              <p className="text-sm text-neutral-600">{item.description}</p>
            </Card>
          ))
        )}
      </div>
    </PageLayout>
  );
}
