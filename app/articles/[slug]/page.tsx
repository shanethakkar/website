import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

import { ArticleChrome } from "@/components/article/ArticleChrome";
import { ArticleFooter } from "@/components/article/ArticleFooter";
import { ArticleHeader } from "@/components/article/ArticleHeader";
import { mdxComponents } from "@/components/article/mdxComponents";
import { ReadingProgress } from "@/components/article/ReadingProgress";
import { DotGrid } from "@/components/DotGrid";
import { getArticle, getArticleSlugs } from "@/lib/articles";

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
  return {
    title: article.title,
    description: article.dek,
    openGraph: {
      title: article.title,
      description: article.dek,
      type: "article",
      publishedTime: article.date,
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
                remarkPlugins: [remarkGfm],
              },
            }}
          />
        </article>

        <ArticleFooter currentSlug={article.slug} />
      </div>
    </>
  );
}
