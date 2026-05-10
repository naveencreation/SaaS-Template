import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie, isSessionExpired } from "@/lib/session";
import { isRouteAllowed, Role } from "@/config/roles.config";
import { features } from "@/config/features.config";

/**
 * Public routes — no session check needed.
 */
const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/link-account",
  "/unauthorized",
  "/maintenance",
];

/**
 * Auth routes — redirect to /dashboard if already logged in.
 */
const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];

/**
 * Static files — always pass through.
 */
const staticFilePattern = /\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf)$/;

/**
 * Next.js middleware — runs on every request before hitting the route handler.
 * Handles: session validation, role checks, maintenance mode, auto-refresh.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Static files — pass through
  if (staticFilePattern.test(pathname)) {
    return NextResponse.next();
  }

  // API routes — pass through to proxy (auth handled by FastAPI)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Get session from access_token cookie (decodes JWT payload, no verification)
  const session = getSessionFromCookie(req);
  const isLoggedIn = !!session;

  // ─── Auth routes: redirect to dashboard if already logged in ────────────
  if (authRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // ─── Maintenance mode: block non-admin/super_admin ────────────────────────
  if (features.maintenanceMode) {
    const isAdmin = session?.role === "admin" || session?.role === "super_admin";
    if (!isAdmin && !publicRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/maintenance", req.url));
    }
  }

  // ─── Public routes: pass through (no session needed) ─────────────────────
  if (publicRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    return NextResponse.next();
  }

  // ─── Protected routes: require session ───────────────────────────────────
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ─── Auto-refresh: if access token is about to expire, try refresh ──────
  if (isSessionExpired(session)) {
    const refreshToken = req.cookies.get("refresh_token")?.value;
    if (refreshToken) {
      try {
        const res = await fetch(`${process.env.BACKEND_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `refresh_token=${refreshToken}`,
          },
        });

        if (res.ok) {
          const response = NextResponse.next();

          // Forward any Set-Cookie headers from the refresh endpoint
          const setCookies = res.headers.getSetCookie();
          for (const cookie of setCookies) {
            response.headers.append("Set-Cookie", cookie);
          }

          return response;
        }
      } catch {
        // Refresh failed — fall through to login redirect
      }
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ─── Role check: is this role allowed on this route? ──────────────────────
  const role = session.role;
  if (!isRouteAllowed(pathname, role)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

/**
 * Middleware matcher — only run on page routes, skip static and API.
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
