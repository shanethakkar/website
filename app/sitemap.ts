import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";

const SITE = "https://shanethakkar.com";

/**
 * /sitemap.xml — enumerates every public URL on the site for crawlers.
 * Articles are pulled from MDX frontmatter so the sitemap auto-updates
 * whenever a new piece ships. `lastModified` for the homepage tracks the
 * most recent article date so search engines see freshness when content
 * is added even though the homepage HTML itself hasn't changed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();
  const newestArticle = articles[0]?.date;

  return [
    {
      url: SITE,
      lastModified: newestArticle ? new Date(newestArticle) : new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    ...articles.map((a) => ({
      url: `${SITE}/articles/${a.slug}`,
      lastModified: new Date(a.date),
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
    {
      url: `${SITE}/Shane-Thakkar-Resume-May-2026.pdf`,
      lastModified: new Date("2026-05-01"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
