import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Layers, Lock, Cpu, Globe } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[30%] -right-[10%] h-[70%] w-[50%] rounded-full bg-primary-100/50 blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] h-[60%] w-[40%] rounded-full bg-secondary-100/50 blur-3xl" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-24 pb-20 text-center lg:pt-32 lg:pb-28">
        <div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:border-gray-300">
            <span className="flex h-2 w-2 rounded-full bg-primary-600 animate-pulse-slow"></span>
            Production-Ready Boilerplate v2.0
          </div>
        </div>

        <h1 
          className="animate-fade-in-up mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-gray-900 sm:text-7xl"
          style={{ animationDelay: "100ms" }}
        >
          Ship your SaaS{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 animate-gradient-x">
            days faster.
          </span>
        </h1>
        
        <p 
          className="animate-fade-in-up mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl leading-relaxed"
          style={{ animationDelay: "200ms" }}
        >
          Stop wrestling with authentication, RBAC, and deployment boilerplate. Get a fully documented, extensible foundation and start building your actual product today.
        </p>
        
        <div 
          className="animate-fade-in-up mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ animationDelay: "300ms" }}
        >
          <Link
            href="/signup"
            className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-primary-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-500/30 transition-all hover:bg-primary-700 hover:shadow-primary-500/40 hover:-translate-y-0.5"
          >
            Start Building
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/docs"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50"
          >
            Read the Docs
          </Link>
        </div>
      </div>

      {/* Tech Stack Banner */}
      <div className="relative z-10 border-y border-gray-100 bg-white/50 backdrop-blur-sm py-8">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-6">Powered by industry standards</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale transition-all hover:grayscale-0 hover:opacity-100 duration-500">
            {["Next.js 14", "FastAPI", "PostgreSQL", "TailwindCSS", "Redis", "Docker"].map((tech) => (
              <span key={tech} className="text-lg font-bold text-gray-800">{tech}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 lg:py-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Everything you need to launch</h2>
          <p className="mt-4 text-lg text-gray-600">We handled the boring stuff so you don't have to.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Rock-solid Auth",
              desc: "Email/password, JWTs in httpOnly cookies, and OAuth (Google, GitHub, Microsoft). Completely secure by default.",
              icon: Lock,
              color: "text-blue-600",
              bg: "bg-blue-50"
            },
            {
              title: "Advanced RBAC",
              desc: "4 predefined roles with route guards, middleware enforcement, and automatic logout upon permission changes.",
              icon: ShieldCheck,
              color: "text-indigo-600",
              bg: "bg-indigo-50"
            },
            {
              title: "Pluggable Architecture",
              desc: "Add new business logic features by copying 4 files. Auto-registration keeps your core clean.",
              icon: Layers,
              color: "text-purple-600",
              bg: "bg-purple-50"
            },
            {
              title: "High Performance",
              desc: "Next.js App Router frontend seamlessly proxying to an async FastAPI backend. Blazing fast responses.",
              icon: Zap,
              color: "text-amber-600",
              bg: "bg-amber-50"
            },
            {
              title: "Admin Dashboard",
              desc: "Built-in user management, high-level analytics, system status, and recent activity logs out of the box.",
              icon: Cpu,
              color: "text-teal-600",
              bg: "bg-teal-50"
            },
            {
              title: "1-Click Deploy",
              desc: "Production-ready Docker Compose stack with Nginx reverse proxy and Let's Encrypt SSL certificates.",
              icon: Globe,
              color: "text-rose-600",
              bg: "bg-rose-50"
            }
          ].map((feature, i) => (
            <div 
              key={feature.title} 
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
            >
              <div className={`mb-4 inline-flex rounded-xl ${feature.bg} p-3`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              
              {/* Subtle hover gradient */}
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 pb-24">
        <div className="overflow-hidden rounded-3xl bg-gray-900 px-6 py-16 sm:p-20 text-center shadow-2xl relative">
          <div className="absolute -top-[50%] -left-[10%] h-[150%] w-[50%] rounded-full bg-primary-600/20 blur-3xl" />
          <div className="absolute -bottom-[50%] -right-[10%] h-[150%] w-[50%] rounded-full bg-secondary-600/20 blur-3xl" />
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Ready to build your next big idea?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
              Join hundreds of developers who are launching products faster with our premium boilerplate.
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                href="/signup"
                className="flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-gray-900 shadow-sm transition-all hover:bg-gray-100 hover:scale-105"
              >
                Get Started for Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
