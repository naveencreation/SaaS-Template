/**
 * EXAMPLE PROXY ROUTE — Template for buyer feature proxies.
 *
 * Copy to: frontend/app/api/business/<your-feature>/route.ts
 * The catch-all proxy (app/api/[...path]/route.ts) already handles
 * all /api/* requests, so this file is optional — but it serves as
 * explicit documentation for buyers who want specific route control.
 */

import { createProxyHandler } from "@/lib/proxy";

export const { GET, POST, PUT, DELETE, PATCH } = createProxyHandler("/business/my-feature");
