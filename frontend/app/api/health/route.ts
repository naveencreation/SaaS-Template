import { createProxyHandler } from "@/lib/proxy";

/**
 * Proxies health check requests to the FastAPI backend.
 *
 * GET /api/health → forwarded to → http://api:8000/api/health
 */
export const { GET } = createProxyHandler("/health");
