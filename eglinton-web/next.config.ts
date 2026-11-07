import type { NextConfig } from "next";

/**
 * Cache Components is intentionally left off for this demo.
 *
 * The mock data layer generates tournaments relative to "now" so the demo
 * never goes stale; that requires request-time rendering. When the real API
 * is connected, caching is applied inside the data layer (see
 * src/data/api/api-provider.ts — fetch `next.revalidate`) rather than in pages.
 */
const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
