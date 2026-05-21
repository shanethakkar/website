import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Permanent (308) redirects. Two kinds:
   *   1. Legacy slugs from the old Substack-era site — keeps inbound links
   *      from older social posts and search indexes pointing at live content.
   *   2. Short shareable aliases for articles with verbose canonical slugs
   *      (e.g. `/f1` → the Bayesian F1 article). The article's own canonical
   *      URL in metadata still points at the long /articles/<slug> form so
   *      Google indexes the canonical, not the alias.
   * Append new entries as needed. */
  async redirects() {
    return [
      {
        source: "/fourth-down-is-still-footballs-biggest-coaching-problem",
        destination: "/articles/fourth-down",
        permanent: true,
      },
      {
        source: "/f1",
        destination: "/articles/f1-bayesian-driver-rankings",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
