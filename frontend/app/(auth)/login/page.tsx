"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { EmailInput } from "@/components/auth/EmailInput";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { OAuthButtonRow } from "@/components/auth/OAuthButtonRow";
import { useMutation } from "@/hooks/useMutation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate, loading, error } = useMutation("/api/auth/login");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await mutate({ email, password });
    if (result) {
      router.push("/dashboard");
    }
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-neutral-900">Welcome back</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Sign in to your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <EmailInput
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <PasswordInput
          labelRight={
            <Link
              href="/forgot-password"
              className="text-sm text-primary-600 hover:underline"
            >
              Forgot?
            </Link>
          }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-error-text">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <OAuthButtonRow />

      <p className="mt-6 text-center text-sm text-neutral-600">
        New here?{" "}
        <Link href="/signup" className="font-medium text-primary-600 hover:underline">
          Create account
        </Link>
      </p>
    </>
  );
}
