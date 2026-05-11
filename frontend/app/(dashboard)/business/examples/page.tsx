"use client";

import { useState } from "react";
import { useData } from "@/hooks/useData";
import { useMutation } from "@/hooks/useMutation";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { PageError } from "@/components/ui/PageError";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface ExampleItem {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export default function ExamplesPage() {
  const { data, loading, error, refetch } = useData<{
    items: ExampleItem[];
    total: number;
  }>("/api/business/examples");

  const { mutate: createItem, loading: creating } = useMutation<ExampleItem>(
    "/api/business/examples",
    "POST"
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("0");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const result = await createItem({
      name,
      description: description || null,
      quantity: parseInt(quantity, 10) || 0,
    });
    if (result) {
      setName("");
      setDescription("");
      setQuantity("0");
      refetch();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/business/examples/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    refetch();
  }

  if (loading) return <PageLayout title="Examples"><PageSkeleton /></PageLayout>;
  if (error) return <PageLayout title="Examples"><PageError message={error} onRetry={refetch} /></PageLayout>;

  const items = data?.items ?? [];

  return (
    <PageLayout title="Examples">
      <div className="space-y-6">
        {/* Create form */}
        <form onSubmit={handleCreate} className="rounded-lg border border-neutral-200 bg-surface-card p-4 space-y-3">
          <h3 className="font-semibold text-neutral-900">Create Example Item</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input
              label="Name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Input
              label="Quantity"
              name="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create Item"}
          </Button>
        </form>

        {/* List */}
        <div className="rounded-lg border border-neutral-200 bg-surface-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-neutral-700">Name</th>
                <th className="px-4 py-2 text-left font-medium text-neutral-700">Description</th>
                <th className="px-4 py-2 text-left font-medium text-neutral-700">Quantity</th>
                <th className="px-4 py-2 text-right font-medium text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-neutral-500">
                    No items yet. Create one above.
                  </td>
                </tr>
              )}
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2 text-neutral-900">{item.name}</td>
                  <td className="px-4 py-2 text-neutral-600">{item.description || "—"}</td>
                  <td className="px-4 py-2 text-neutral-900">{item.quantity}</td>
                  <td className="px-4 py-2 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
}
