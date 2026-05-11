"use client";

import { useData } from "@/hooks/useData";
import { useMutation } from "@/hooks/useMutation";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { PageError } from "@/components/ui/PageError";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { CanAccess } from "@/components/rbac/CanAccess";
import { Trash2, ShieldCheck, ShieldX } from "lucide-react";

interface UserItem {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

interface RoleItem {
  id: string;
  name: string;
}

interface UserListResponse {
  items: UserItem[];
}

export default function UserManagementPage() {
  const { data: usersData, loading, error, refetch } = useData<UserListResponse>("/api/users");
  const { data: rolesData } = useData<{ items: RoleItem[] }>("/api/users/roles");

  const users = usersData?.items ?? [];
  const roles = rolesData?.items ?? [];

  // Dynamic-URL mutations: useMutation takes a fixed URL, so inline fetch
  // is used here. The list fetch above uses useData per §8.4.
  async function toggleActive(user: UserItem) {
    await fetch(`/api/users/${user.id}/active`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !user.is_active }),
    });
    refetch();
  }

  async function updateRole(userId: string, roleId: string) {
    await fetch(`/api/users/${userId}/role`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role_id: roleId }),
    });
    refetch();
  }

  async function deleteUser(userId: string) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    await fetch(`/api/users/${userId}`, {
      method: "DELETE",
      credentials: "include",
    });
    refetch();
  }

  if (loading) return <PageLayout title="User Management"><PageSkeleton /></PageLayout>;
  if (error) return <PageLayout title="User Management"><PageError message={error} onRetry={refetch} /></PageLayout>;

  return (
    <PageLayout title="User Management">
      <DataTable
        columns={[
          { key: "full_name", header: "Name" },
          { key: "email", header: "Email" },
          {
            key: "role",
            header: "Role",
            render: (row: UserItem) => (
              <CanAccess roles={["super_admin"]}>
                <select
                  value={roles.find((r) => r.name === row.role)?.id || ""}
                  onChange={(e) => updateRole(row.id, e.target.value)}
                  className="rounded border border-neutral-300 px-2 py-1 text-sm"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </CanAccess>
            ),
          },
          {
            key: "is_active",
            header: "Status",
            render: (row: UserItem) => (
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  row.is_active
                    ? "bg-success-bg text-success-text"
                    : "bg-error-bg text-error-text"
                }`}
              >
                {row.is_active ? "Active" : "Inactive"}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (row: UserItem) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleActive(row)}
                >
                  <span title={row.is_active ? "Deactivate" : "Activate"}>
                    {row.is_active ? (
                      <ShieldX className="h-4 w-4 text-error-solid" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 text-success-solid" />
                    )}
                  </span>
                </Button>
                <CanAccess roles={["super_admin"]}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteUser(row.id)}
                  >
                    <span title="Delete">
                      <Trash2 className="h-4 w-4 text-error-solid" />
                    </span>
                  </Button>
                </CanAccess>
              </div>
            ),
          },
        ]}
        data={users}
        keyExtractor={(row) => row.id}
      />
    </PageLayout>
  );
}
