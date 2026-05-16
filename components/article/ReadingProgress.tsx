"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Thin cyan reading-progress bar pinned to the very top of the viewport.
 * Width tracks document scroll progress (0 → 100% as the reader moves from
 * the article header to the bottom of the footer). Spring-smoothed so it
 * glides rather than jitters during fast scrolls or trackpad inertia.
 *
 * Mounted only on article pages (see app/articles/[slug]/page.tsx) — the
 * homepage doesn't need a progress affordance because it's not a single
 * piece of long-form content.
 */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX, transformOrigin: "0% 50%" }}
      className="fixed inset-x-0 top-0 z-50 h-[2px] bg-accent shadow-[0_0_8px_rgba(34,211,238,0.45)]"
    />
  );
}
