"use client";

import { useState } from "react";
import { useData } from "@/hooks/useData";
import { useMutation } from "@/hooks/useMutation";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { PageError } from "@/components/ui/PageError";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useSession } from "@/hooks/useSession";
import { User, Lock } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export default function ProfilePage() {
  const { session } = useSession();
  const { data: profile, loading, error, refetch } = useData<UserProfile>("/api/users/me");
  const { mutate: updateProfile, loading: saving } = useMutation<UserProfile>("/api/users/me", "PUT");
  const { mutate: changePassword, loading: pwLoading } = useMutation<{ success: boolean; message: string }>("/api/users/me/password", "PUT");

  const [editedName, setEditedName] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  // Password change state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  async function handleSave() {
    if (!profile) return;
    setSaveMsg("");
    const result = await updateProfile({ full_name: editedName || profile.full_name });
    if (result) {
      setSaveMsg("Profile updated.");
      refetch();
    } else {
      setSaveMsg("Update failed.");
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (newPw !== confirmPw) {
      setPwError("Passwords do not match.");
      return;
    }
    const result = await changePassword({ current_password: currentPw, new_password: newPw });
    if (result) {
      setPwSuccess("Password updated. Please log in again.");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } else {
      setPwError("Password change failed.");
    }
  }

  if (loading) return <PageLayout title="Profile"><PageSkeleton /></PageLayout>;
  if (error) return <PageLayout title="Profile"><PageError message={error} /></PageLayout>;
  if (!profile) return null;

  return (
    <PageLayout title="Profile">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile info */}
        <Card>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-neutral-900">Account Info</h2>
          </div>
          <div className="mt-4 space-y-4">
            <Input label="Email" name="email" value={profile.email} disabled />
            <Input
              label="Full Name"
              name="full_name"
              value={editedName || profile.full_name}
              onChange={(e) => setEditedName(e.target.value)}
            />
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium capitalize">
                {profile.role.replace("_", " ")}
              </span>
              {profile.is_verified && (
                <span className="rounded-full bg-success-bg px-2 py-1 text-xs font-medium text-success-text">
                  Verified
                </span>
              )}
            </div>
            {saveMsg && (
              <p className={`text-sm ${saveMsg.includes("updated") ? "text-success-text" : "text-error-text"}`}>
                {saveMsg}
              </p>
            )}
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card>

        {/* Password change */}
        <Card>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-neutral-900">Change Password</h2>
          </div>
          <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
            <Input
              label="Current Password"
              name="current_password"
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              required
            />
            <Input
              label="New Password"
              name="new_password"
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              required
            />
            <Input
              label="Confirm New Password"
              name="confirm_password"
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              required
            />
            {pwError && <p className="text-sm text-error-text">{pwError}</p>}
            {pwSuccess && <p className="text-sm text-success-text">{pwSuccess}</p>}
            <Button type="submit" className="w-full">Change Password</Button>
          </form>
        </Card>
      </div>
    </PageLayout>
  );
}
