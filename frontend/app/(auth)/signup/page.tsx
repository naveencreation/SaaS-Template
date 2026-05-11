"use client";

import { useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmailInput } from "@/components/auth/EmailInput";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { OAuthButtonRow } from "@/components/auth/OAuthButtonRow";
import { useMutation } from "@/hooks/useMutation";

export default function SignupPage() {
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [clientError, setClientError] = useState("");
  const { mutate, loading, error } = useMutation("/api/auth/signup");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setClientError("");

    if (password !== confirmPassword) {
      setClientError("Passwords do not match.");
      return;
    }
    if (!agreed) {
      setClientError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    const result = await mutate({ full_name: fullName, email, password });
    if (result) {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <>
        <h2 className="text-2xl font-bold text-neutral-900">Check your email</h2>
        <p className="mt-2 text-neutral-600">
          We sent a verification link to <strong>{email}</strong>. Click it to
          activate your account.
        </p>
        <p className="mt-4 text-sm text-neutral-500">
          Check your spam folder if you don&apos;t see it within a few minutes.
        </p>
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-neutral-900">Create account</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Get started in 30 seconds
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full name"
          name="full_name"
          placeholder="John Doe"
          value={fullName}
          leftIcon={<User className="h-4 w-4" />}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <EmailInput
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <PasswordInput
          placeholder="8+ chars, 1 uppercase, 1 number"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <PasswordInput
          label="Confirm Password"
          name="confirm_password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-neutral-600">
            I agree to the{" "}
            <Link href="/terms" className="text-primary-600 hover:underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary-600 hover:underline">
              Terms of Service
            </Link>
          </span>
        </label>

        {(clientError || error) && (
          <p className="text-sm text-error-text">{clientError || error}</p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating account..." : "Get Started"}
        </Button>
      </form>

      <OAuthButtonRow />

      <p className="mt-6 text-center text-sm text-neutral-600">
        Have an account?{" "}
        <Link href="/login" className="font-medium text-primary-600 hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
