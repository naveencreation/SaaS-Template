import { NextRequest, NextResponse } from "next/server";

/**
 * Creates a proxy handler that forwards requests to the FastAPI backend.
 *
 * Usage:
 *   export const { GET, POST, PUT, DELETE, PATCH } = createProxyHandler('/your-feature')
 *
 * @param path - The backend API path to proxy to (e.g. '/health', '/users')
 */
export function createProxyHandler(path: string = "") {
  const handler = async (req: NextRequest) => {
    const proxyPath = path || req.nextUrl.pathname.replace(/^\/api/, "");
    const backendUrl = `${process.env.BACKEND_URL}${proxyPath}${req.nextUrl.search}`;

    const headers: HeadersInit = {
      "Content-Type": req.headers.get("Content-Type") || "application/json",
    };

    // Forward Authorization header if present
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    // Forward Cookie header for session cookies
    const cookieHeader = req.headers.get("Cookie");
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader;
    }

    const body = req.method !== "GET" && req.method !== "HEAD"
      ? await req.text()
      : undefined;

    try {
      const response = await fetch(backendUrl, {
        method: req.method,
        headers,
        body,
      });

      const data = await response.json().catch(() => ({}));

      const res = NextResponse.json(data, { status: response.status });

      // Forward Set-Cookie headers so httpOnly cookies reach the browser
      const setCookie = response.headers.getSetCookie();
      for (const cookie of setCookie) {
        res.headers.append("Set-Cookie", cookie);
      }

      return res;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NETWORK_ERROR",
            message: "Failed to reach backend",
            status: 503,
          },
        },
        { status: 503 }
      );
    }
  };

  return {
    GET: handler,
    POST: handler,
    PUT: handler,
    DELETE: handler,
    PATCH: handler,
  };
}
