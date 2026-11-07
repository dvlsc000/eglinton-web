import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Demo builds are never indexed. Switch happens automatically with NEXT_PUBLIC_DATA_MODE=api.
  const live = process.env.NEXT_PUBLIC_DATA_MODE === "api";
  return {
    rules: live ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" },
    sitemap: live ? `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/sitemap.xml` : undefined,
  };
}
