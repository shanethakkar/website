"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowDownToLine } from "lucide-react";

const sections = [
  { id: "work", number: "01", label: "work" },
  { id: "writing", number: "02", label: "writing" },
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

    const observer = new IntersectionObserver(
      (entries) => {
        // If we're already pinned at the bottom of the page, leave contact
        // active and ignore IO callbacks (the activation band can briefly
        // re-pick up earlier sections on scroll bounce).
        const atBottom =
          window.scrollY + window.innerHeight >=
          document.documentElement.scrollHeight - 80;
        if (atBottom) return;

        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) -
              Math.abs(b.boundingClientRect.top),
          );
        if (visible[0]) {
          const matched = sections.find((s) => s.id === visible[0].target.id);
          if (matched) setActiveSection(matched);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 },
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    // Bottom-of-page edge case: contact is the final section and may sit
    // entirely below the IO activation band. Force it active when the user
    // has scrolled within 80px of the bottom.
    const onScroll = () => {
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 80;
      if (atBottom) {
        setActiveSection((prev) => (prev.id === contact.id ? prev : contact));
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
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

        {/* Resume CTA */}
        <a
          href="/Shane-Thakkar-Resume-May-2026.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.02] px-3.5 py-1.5 font-mono text-[11.5px] tracking-[0.16em] text-fg-muted transition-all hover:border-accent-border hover:bg-accent-soft hover:text-accent-bright"
        >
          <ArrowDownToLine
            size={12}
            strokeWidth={2}
            className="transition-transform group-hover:translate-y-0.5"
          />
          RESUME
        </a>
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
