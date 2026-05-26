import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import { ArticleChrome } from "@/components/article/ArticleChrome";
import { ArticleFooter } from "@/components/article/ArticleFooter";
import { ArticleHeader } from "@/components/article/ArticleHeader";
import { mdxComponents } from "@/components/article/mdxComponents";
import { ReadingProgress } from "@/components/article/ReadingProgress";
import { DotGrid } from "@/components/DotGrid";
import { getArticle, getArticleSlugs } from "@/lib/articles";
import {
  buildArticleSchema,
  schemaToJsonString,
  SITE_URL,
} from "@/lib/schema";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const url = `${SITE_URL}/articles/${slug}`;
  return {
    title: article.title,
    description: article.dek,
    alternates: { canonical: url },
    authors: [{ name: "Shane Thakkar", url: SITE_URL }],
    openGraph: {
      title: article.title,
      description: article.dek,
      url,
      siteName: "Shane Thakkar",
      type: "article",
      publishedTime: article.date,
      modifiedTime: article.date,
      authors: ["Shane Thakkar"],
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.dek,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <>
      {/* BlogPosting JSON-LD — references the homepage Person via @id so
       * Google links every article back to a single consolidated identity.
       * Makes articles eligible for rich-result treatment in search. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: schemaToJsonString(buildArticleSchema(article)),
        }}
      />

      <ReadingProgress />
      <DotGrid />

      <div className="relative z-10">
        <ArticleChrome />

        <ArticleHeader
          slug={article.slug}
          title={article.title}
          date={article.date}
          dek={article.dek}
          category={article.category}
          tags={article.tags}
          readingMinutes={article.readingMinutes}
          repo={article.repo}
        />

        <article className="article-body mx-auto w-full max-w-6xl px-6 pt-10 sm:px-8">
          <MDXRemote
            source={article.body}
            components={mdxComponents}
            options={{
              parseFrontmatter: false,
              mdxOptions: {
                remarkPlugins: [remarkGfm, remarkMath],
                rehypePlugins: [rehypeKatex],
              },
            }}
          />
        </article>

        <ArticleFooter currentSlug={article.slug} />
      </div>
    </>
  );
}
