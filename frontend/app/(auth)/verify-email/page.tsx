"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageSkeleton } from "@/components/ui/PageSkeleton";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing verification token.");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`, {
          credentials: "include",
        });
        const json = await res.json();
        if (json.success) {
          setStatus("success");
          setMessage(json.message);
          setTimeout(() => router.push("/dashboard"), 2000);
        } else {
          setStatus("error");
          setMessage(json.error?.message || "Verification failed.");
        }
      } catch {
        setStatus("error");
        setMessage("Network error. Please try again.");
      }
    }

    verify();
  }, [token, router]);

  if (status === "loading") {
    return (
      <Card>
        <PageSkeleton />
      </Card>
    );
  }

  return (
    <Card>
      <h2
        className={`text-2xl font-bold ${
          status === "success" ? "text-green-700" : "text-red-700"
        }`}
      >
        {status === "success" ? "Email verified!" : "Verification failed"}
      </h2>
      <p className="mt-2 text-gray-600">{message}</p>
      {status === "success" && (
        <p className="mt-2 text-sm text-gray-500">
          Redirecting you to the dashboard...
        </p>
      )}
      {status === "error" && (
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => router.push("/login")}
        >
          Go to login
        </Button>
      )}
    </Card>
  );
}
