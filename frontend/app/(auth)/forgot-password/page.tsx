"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useMutation } from "@/hooks/useMutation";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const { mutate, loading, error } = useMutation("/api/auth/forgot-password");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await mutate({ email });
    if (result || !error) {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <Card>
        <h2 className="text-2xl font-bold text-neutral-900">Check your email</h2>
        <p className="mt-2 text-neutral-600">
          If an account exists with that email, we&apos;ve sent a password reset
          link.
        </p>
        <p className="mt-4 text-sm text-neutral-500">
          <Link href="/login" className="text-primary-600 hover:underline">
            Back to login
          </Link>
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold text-neutral-900">Reset password</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <p className="text-sm text-error-text">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        Remember your password?{" "}
        <Link href="/login" className="text-primary-600 hover:underline">
          Log in
        </Link>
      </p>
    </Card>
  );
}
