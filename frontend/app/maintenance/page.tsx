export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-neutral-900">Under Maintenance</h1>
        <p className="mt-4 text-lg text-neutral-600">
          We&apos;re performing scheduled maintenance. Please check back later.
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          Administrators can still access the dashboard.
        </p>
      </div>
    </div>
  );
}
