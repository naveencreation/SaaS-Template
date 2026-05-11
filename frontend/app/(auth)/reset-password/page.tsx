"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/auth/PasswordInput";
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
      <>
        <h2 className="text-2xl font-bold text-success-text">Password updated</h2>
        <p className="mt-2 text-neutral-600">
          Your password has been reset successfully.
        </p>
        <p className="mt-4 text-sm text-neutral-500">
          <Link href="/login" className="text-primary-600 hover:underline">
            Log in with your new password
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-neutral-900">Set new password</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          label="New password"
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <PasswordInput
          label="Confirm password"
          name="confirm"
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        {matchError && <p className="text-sm text-error-text">{matchError}</p>}
        {error && <p className="text-sm text-error-text">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Updating..." : "Reset password"}
        </Button>
      </form>
    </>
  );
}
