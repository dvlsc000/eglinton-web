import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/schedule", "/leaderboard", "/leagues/tournament", "/leagues/cash", "/archive", "/club", "/visit", "/responsible-gaming"].map(
    (p) => ({ url: `${BASE}${p}`, changeFrequency: p === "/schedule" || p === "/leaderboard" ? "daily" : "monthly" })
  );
}
