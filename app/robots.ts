import type { MetadataRoute } from "next";

const SITE = "https://shanethakkar.com";

/**
 * /robots.txt — allow all reputable crawlers; point them at the sitemap.
 * No API routes or private paths to disallow at the moment.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
