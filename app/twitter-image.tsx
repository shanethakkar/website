/** Re-export the OG image as the Twitter card so we ship one canonical image.
 * Next.js's file-based metadata picks this up at /twitter-image.png and emits
 * <meta name="twitter:image"> / <meta name="twitter:card" content="summary_large_image">. */
export { default, alt, contentType, size } from "./opengraph-image";
