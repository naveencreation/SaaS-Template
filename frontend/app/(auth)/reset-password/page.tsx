"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useMutation } from "@/hooks/useMutation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [matchError, setMatchError] = useState("");
  const { mutate, loading, error } = useMutation("/api/auth/reset-password");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMatchError("");

    if (password !== confirm) {
      setMatchError("Passwords do not match.");
      return;
    }

    if (!token) {
      setMatchError("Invalid or missing reset token.");
      return;
    }

    const result = await mutate({ token, new_password: password });
    if (result) {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <Card>
        <h2 className="text-2xl font-bold text-green-700">Password updated</h2>
        <p className="mt-2 text-gray-600">
          Your password has been reset successfully.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          <Link href="/login" className="text-primary-600 hover:underline">
            Log in with your new password
          </Link>
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-900">Set new password</h2>
      <p className="mt-1 text-sm text-gray-600">
        Enter your new password below.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="New password"
          name="password"
          type="password"
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          label="Confirm password"
          name="confirm"
          type="password"
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        {matchError && <p className="text-sm text-red-600">{matchError}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Updating..." : "Reset password"}
        </Button>
      </form>
    </Card>
  );
}
