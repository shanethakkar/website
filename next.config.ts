import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Permanent (308) redirects from old Substack-era slugs to the new
   * `/articles/<slug>` routes. Keeps inbound links from older social posts,
   * newsletters, and search-engine indexes pointing at live content instead
   * of 404ing. Append new entries as old links surface. */
  async redirects() {
    return [
      {
        source: "/fourth-down-is-still-footballs-biggest-coaching-problem",
        destination: "/articles/fourth-down",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
