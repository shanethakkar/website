"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

const sections = [
  { id: "work", number: "01", label: "work" },
  { id: "projects", number: "02", label: "projects" },
  { id: "tech", number: "03", label: "tech" },
  { id: "about", number: "04", label: "about" },
  { id: "contact", number: "05", label: "contact" },
] as const;

/**
 * Sticky top navigation. The header pins to the top of the viewport on scroll
 * and tracks the active section via IntersectionObserver. The active link
 * gets a brighter label, cyan number, and a sliding cyan underline (shared
 * `layoutId` so framer-motion smoothly animates it between items as you
 * scroll). A thin scroll-progress bar runs along the bottom edge.
 *
 * Solid gradient background + backdrop blur ensure the dot grid never
 * competes with the type, even after content scrolls beneath it.
 */
export function MorphingNav() {
  const [activeSection, setActiveSection] =
    useState<(typeof sections)[number]>(sections[0]);

  const { scrollYProgress } = useScroll();
  const progressX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const contact = sections[sections.length - 1];
    let rafId = 0;

    /**
     * Scroll-spy with two rules, evaluated on every scroll (rAF-throttled):
     *   1. If we're at (or within ~4px of) the bottom of the page, contact
     *      wins. The final section is often shorter than the activation band,
     *      so its top never crosses the threshold even when fully visible.
     *   2. Otherwise: the active section is the LAST one whose top edge has
     *      scrolled above the threshold (30% of viewport height from the
     *      top). This gives a clean "as soon as the next section's title is
     *      ~1/3 of the way up, switch to it" feel.
     */
    const compute = () => {
      rafId = 0;

      const scrollBottom = window.scrollY + window.innerHeight;
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
      );

      if (scrollBottom >= docHeight - 4) {
        setActiveSection((prev) =>
          prev.id === contact.id ? prev : contact,
        );
        return;
      }

      const threshold = window.innerHeight * 0.3;
      let active: (typeof sections)[number] = sections[0];
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= threshold) {
          active = s;
        }
      }
      setActiveSection((prev) => (prev.id === active.id ? prev : active));
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header
      className="sticky top-0 z-50 border-b border-border-subtle"
      style={{
        background:
          "linear-gradient(180deg, rgba(12, 12, 14, 0.96) 0%, rgba(12, 12, 14, 0.92) 70%, rgba(12, 12, 14, 0.78) 100%)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      {/* Cyan gradient hairline along top edge */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(34, 211, 238, 0.22) 50%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3.5 sm:px-8 sm:py-4">
        {/* Wordmark */}
        <a
          href="#top"
          className="group flex items-center gap-2.5 font-mono text-[13px] tracking-[0.2em] text-fg-bright"
        >
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          <span>SHANE THAKKAR</span>
          <span className="hidden text-fg-dim sm:inline">/</span>
          <span className="hidden text-fg-muted sm:inline">DATA SCIENTIST</span>
        </a>

        {/* Section links — hidden on small screens */}
        <nav className="hidden items-center gap-8 md:flex">
          {sections.map((s) => {
            const isActive = s.id === activeSection.id;
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="group relative flex items-baseline gap-2 py-1 font-mono text-[14px] tracking-[0.14em] transition-colors"
              >
                <span
                  className={`text-[11px] transition-colors ${
                    isActive
                      ? "text-accent"
                      : "text-fg-dim group-hover:text-accent"
                  }`}
                >
                  {s.number}
                </span>
                <span
                  className={`transition-colors ${
                    isActive
                      ? "text-fg-bright"
                      : "text-fg-muted group-hover:text-fg-bright"
                  }`}
                >
                  {s.label}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="nav-active-underline"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-accent"
                    style={{
                      boxShadow: "0 0 8px rgba(34, 211, 238, 0.6)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 32,
                    }}
                    aria-hidden="true"
                  />
                )}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Scroll progress indicator — pinned to bottom edge of header */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-accent"
        style={{ scaleX: progressX }}
        aria-hidden="true"
      />
    </header>
  );
}
