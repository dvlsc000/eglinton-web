/**
 * Content provider abstraction. Today it returns the typed config in
 * ./site.ts. A CMS (Sanity, Contentful, Payload, a custom admin) can be
 * plugged in by implementing `ContentProvider` and switching `getContent`.
 */
import "server-only";
import { cache } from "react";
import type { SiteContent } from "./types";
import { SITE_CONTENT } from "./site";

export interface ContentProvider {
  getSiteContent(): Promise<SiteContent>;
}

class ConfigContentProvider implements ContentProvider {
  async getSiteContent() {
    return SITE_CONTENT;
  }
}

const provider: ContentProvider = new ConfigContentProvider();

export const getContent = cache(() => provider.getSiteContent());
