import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Article system.
 *
 * Articles live as MDX files in `content/articles/<slug>.mdx` with YAML
 * frontmatter at the top. This module is a tiny wrapper around `gray-matter`
 * that hands the route a typed shape. All reads happen at build time
 * (RSC + generateStaticParams), so synchronous fs is fine.
 */

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

export interface ArticleMeta {
  slug: string;
  title: string;
  /** ISO date, e.g. "2026-04-22". */
  date: string;
  /** One-line summary that runs under the title. */
  dek: string;
  /** Short category label shown as the eyebrow (e.g. "NFL · WPA · XGBoost"). */
  category: string;
  /** Lowercase tag chips shown on the homepage card. */
  tags: string[];
  /** Estimated read time in minutes, derived from word count. */
  readingMinutes: number;
  /** Optional URL to the article's GitHub repo. Rendered as a "Source"
   * pill in the article header when set. */
  repo?: string;
}

export interface Article extends ArticleMeta {
  /** Raw MDX body (frontmatter stripped). */
  body: string;
}

interface RawFrontmatter {
  title?: string;
  date?: string;
  dek?: string;
  category?: string;
  tags?: string[];
  repo?: string;
}

function dirExists(): boolean {
  return fs.existsSync(ARTICLES_DIR) && fs.statSync(ARTICLES_DIR).isDirectory();
}

function estimateReadingMinutes(text: string): number {
  // 220 wpm is a reasonable average for editorial prose. Round up so very
  // short pieces still read as "1 min" rather than zero.
  const words = text
    .replace(/[`*_>#~\-|]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function getArticleSlugs(): string[] {
  if (!dirExists()) return [];
  return (
    fs
      .readdirSync(ARTICLES_DIR)
      .filter((f) => f.endsWith(".mdx"))
      // Files starting with `_` are templates / drafts and are skipped by
      // the build. Lets us co-locate `_TEMPLATE.mdx` and any in-progress
      // pieces without exposing them as public routes.
      .filter((f) => !f.startsWith("_"))
      .map((f) => f.replace(/\.mdx$/, ""))
  );
}

export function getArticle(slug: string): Article | null {
  if (!dirExists()) return null;
  const filePath = path.join(ARTICLES_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { content, data } = matter(raw);
  const fm = data as RawFrontmatter;

  if (!fm.title || !fm.date || !fm.dek || !fm.category) {
    throw new Error(
      `Article "${slug}" is missing required frontmatter (title, date, dek, category).`,
    );
  }

  return {
    slug,
    title: fm.title,
    date: fm.date,
    dek: fm.dek,
    category: fm.category,
    tags: fm.tags ?? [],
    repo: fm.repo,
    readingMinutes: estimateReadingMinutes(content),
    body: content,
  };
}

export function getAllArticles(): ArticleMeta[] {
  return getArticleSlugs()
    .map((slug) => getArticle(slug))
    .filter((a): a is Article => a !== null)
    .map(({ body: _body, ...meta }) => meta)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Format an ISO date string as "APR 22 '26" — matches the homepage card style.
 * Returns the input untouched if it can't be parsed.
 */
export function formatArticleDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const month = d
    .toLocaleString("en-US", { month: "short", timeZone: "UTC" })
    .toUpperCase();
  const day = d.getUTCDate();
  const year = String(d.getUTCFullYear()).slice(-2);
  return `${month} ${day} '${year}`;
}
