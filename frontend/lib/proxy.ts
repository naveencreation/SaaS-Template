import { NextRequest, NextResponse } from "next/server";

/**
 * Creates a proxy handler that forwards requests to the FastAPI backend.
 *
 * Usage:
 *   export const { GET, POST, PUT, DELETE, PATCH } = createProxyHandler('/your-feature')
 *
 * @param path - The backend API path to proxy to (e.g. '/health', '/users')
 */
export function createProxyHandler(path: string) {
  const handler = async (req: NextRequest) => {
    const backendUrl = `${process.env.BACKEND_URL}${path}${req.nextUrl.search}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Forward Authorization header if present (from session cookie)
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
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

      return NextResponse.json(data, { status: response.status });
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
