import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shanethakkar.com"),
  title: {
    default: "Shane Thakkar — Data Analyst",
    template: "%s — Shane Thakkar",
  },
  description:
    "I build full-stack data products and write about NFL coaching decisions, F1 driver skill, and what the data says when conventional wisdom is wrong.",
  openGraph: {
    title: "Shane Thakkar — Data Analyst",
    description:
      "Full-stack data products + writing on sports analytics, modeling, and selection bias.",
    url: "https://shanethakkar.com",
    siteName: "Shane Thakkar",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@shanethakkar",
  },
};

/** Sets the address-bar / status-bar color on mobile browsers so the OS chrome
 * blends into the site's dark background instead of flashing white on load. */
export const viewport: Viewport = {
  themeColor: "#0c0c0e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-bg text-fg">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
