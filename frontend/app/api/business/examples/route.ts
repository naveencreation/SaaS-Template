import { createProxyHandler } from "@/lib/proxy";

/**
 * Proxy for /api/business/examples → FastAPI /api/business/examples
 * The catch-all proxy already handles this, but this explicit route
 * serves as a working example for buyers adding their own features.
 */
export const { GET, POST, PUT, DELETE } = createProxyHandler("/business/examples");
