import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 text-center">
      <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
        Build your SaaS faster
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
        A production-grade starter template with auth, RBAC, dashboard, and
        business logic patterns. Focus on your product, not the boilerplate.
      </p>
      <div className="mt-10 flex items-center justify-center gap-4">
        <Link
          href="/signup"
          className="rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
        >
          Log in
        </Link>
      </div>

      <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {[
          {
            title: "Authentication",
            desc: "JWT + OAuth + email verification out of the box.",
          },
          {
            title: "Role-Based Access",
            desc: "4 roles, route guards, and force logout on role change.",
          },
          {
            title: "Pluggable Business Logic",
            desc: "Add a feature with 4 files and 2 config lines.",
          },
        ].map((f) => (
          <div key={f.title} className="rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
            <p className="mt-2 text-gray-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
