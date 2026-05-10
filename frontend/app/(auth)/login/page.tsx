"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useMutation } from "@/hooks/useMutation";
import { getEnabledProviders } from "@/config/auth.config";

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

  const providers = getEnabledProviders();

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-900">Log in</h2>
      <p className="mt-1 text-sm text-gray-600">
        Welcome back! Please enter your details.
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
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        <Link href="/forgot-password" className="text-blue-600 hover:underline">
          Forgot password?
        </Link>
      </p>

      {providers.length > 0 && (
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {providers.map((p) => (
              <a
                key={p.id}
                href={`/api/auth/oauth/${p.id}`}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {p.name}
              </a>
            ))}
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </p>
    </Card>
  );
}
