export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-neutral-900">404</h1>
        <p className="mt-4 text-xl text-neutral-600">Page not found.</p>
        <a
          href="/"
          className="mt-8 inline-block rounded-md bg-primary-600 px-6 py-3 text-white hover:bg-primary-700"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
