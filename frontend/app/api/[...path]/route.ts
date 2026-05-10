import { createProxyHandler } from "@/lib/proxy";

/**
 * Catch-all proxy route — forwards any /api/* request to the FastAPI backend.
 * Specific routes (like /api/health) override this if they exist.
 */
export const { GET, POST, PUT, DELETE, PATCH } = createProxyHandler("");
