import type { ArticleMeta } from "@/lib/articles";

/**
 * schema.org JSON-LD builders.
 *
 * The Person entity is the canonical identity for "Shane Thakkar" on this site —
 * its @id (`SITE_URL#person`) is referenced from every BlogPosting's author so
 * Google links articles back to a single, consolidated identity. The sameAs
 * array is what tells Google that the LinkedIn / GitHub / Twitter accounts and
 * this site are the same Person — the load-bearing signal for owning the
 * "Shane Thakkar" SERP.
 */

export const SITE_URL = "https://shanethakkar.com";
export const PERSON_ID = `${SITE_URL}#person`;
export const WEBSITE_ID = `${SITE_URL}#website`;

const PERSON_SAME_AS = [
  "https://www.linkedin.com/in/shanethakkar",
  "https://github.com/shanethakkar",
  "https://nfl-grades.shanethakkar.com",
];

/** Person + WebSite graph emitted on the homepage. */
export function buildHomeSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: "Shane Thakkar",
        givenName: "Shane",
        familyName: "Thakkar",
        alternateName: "shanethakkar",
        url: SITE_URL,
        image: `${SITE_URL}/opengraph-image`,
        jobTitle: "Data Scientist",
        description:
          "Data analyst building analytics and machine learning projects.",
        alumniOf: {
          "@type": "CollegeOrUniversity",
          name: "The University of Texas at Dallas",
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: "Dallas",
          addressRegion: "TX",
          addressCountry: "US",
        },
        knowsAbout: [
          "Data Science",
          "Sports Analytics",
          "Bayesian Modeling",
          "NFL Analytics",
          "Formula 1 Analytics",
          "Business Intelligence",
          "Python",
          "SQL",
          "R",
        ],
        sameAs: PERSON_SAME_AS,
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: "Shane Thakkar",
        description:
          "Shane Thakkar's portfolio of analytics and machine learning projects.",
        author: { "@id": PERSON_ID },
        inLanguage: "en-US",
      },
    ],
  };
}

/** BlogPosting graph emitted on each article page. */
export function buildArticleSchema(article: ArticleMeta) {
  const url = `${SITE_URL}/articles/${article.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: article.title,
    description: article.dek,
    url,
    datePublished: article.date,
    dateModified: article.date,
    image: [`${url}/opengraph-image`],
    articleSection: article.category,
    keywords: article.tags,
    inLanguage: "en-US",
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
  };
}

/**
 * Serialize a schema object for safe inlining in an HTML `<script>` tag.
 * The only character that can break out of `<script type="application/ld+json">`
 * is `<` (e.g. a literal `</script>` inside a string), so we escape it.
 */
export function schemaToJsonString(schema: unknown): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
