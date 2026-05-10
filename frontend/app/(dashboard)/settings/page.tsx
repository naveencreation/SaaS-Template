"use client";

import { PageLayout } from "@/components/ui/PageLayout";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Settings, Shield, Database, Mail } from "lucide-react";
import { features } from "@/config/features.config";
import { useSession } from "@/hooks/useSession";

export default function SettingsPage() {
  const { session } = useSession();

  return (
    <PageLayout title="System Settings">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Application Info</h2>
          </div>
          <div className="mt-4 space-y-3">
            <Input label="App Name" name="app_name" value="SaaS Template" disabled />
            <Input label="Environment" name="env" value="Development" disabled />
            <Input label="Version" name="version" value="1.0.0" disabled />
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Email Verification Required</span>
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                {features.emailVerification ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Registration Open</span>
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                {features.registrationOpen ? "Open" : "Closed"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Maintenance Mode</span>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                features.maintenanceMode ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              }`}>
                {features.maintenanceMode ? "Active" : "Off"}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Database</h2>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>PostgreSQL 15 with async SQLAlchemy</p>
            <p className="mt-1">Redis 7 for session &amp; cache</p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Email Providers</h2>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>MailHog (dev), Resend, SendGrid, SMTP supported.</p>
            <p className="mt-1">Configured via environment variables.</p>
          </div>
        </Card>
      </div>

      {session && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-500">
          Logged in as <strong>{session.email}</strong> ({session.role})
        </div>
      )}
    </PageLayout>
  );
}
