"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useMutation } from "@/hooks/useMutation";

export default function SignupPage() {
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate, loading, error } = useMutation("/api/auth/signup");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await mutate({ full_name: fullName, email, password });
    if (result) {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <Card>
        <h2 className="text-2xl font-bold text-neutral-900">Check your email</h2>
        <p className="mt-2 text-neutral-600">
          We sent a verification link to <strong>{email}</strong>. Click it to
          activate your account.
        </p>
        <p className="mt-4 text-sm text-neutral-500">
          Check your spam folder if you don&apos;t see it within a few minutes.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold text-neutral-900">Create an account</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Start your free trial today.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="Full name"
          name="full_name"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-error-text">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating account..." : "Sign up"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        Already have an account?{" "}
        <Link href="/login" className="text-primary-600 hover:underline">
          Log in
        </Link>
      </p>
    </Card>
  );
}
