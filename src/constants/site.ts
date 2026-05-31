/** Runtime site constants (aligned with seoMeta.ts). */
export { SEO as SITE_SEO, buildKeywords as buildSiteKeywords } from "./seoMeta";

import { SEO } from "./seoMeta";

export const SITE_URL = (
  import.meta.env.VITE_SITE_URL as string | undefined
)?.replace(/\/$/, "") || SEO.defaultUrl;

export const SITE_NAME = SEO.siteName;
export const SITE_TITLE = SEO.title;
export const SITE_DESCRIPTION = SEO.description;
export const SITE_KEYWORDS = SEO.keywords.join(", ");
