"use client";

import { motion, useInView } from "framer-motion";
import { ArrowDownToLine, ArrowUpRight, Mail } from "lucide-react";
import { useRef } from "react";
import { GitHubLogo, LinkedInLogo, type IconType } from "@/components/icons";

interface ContactLink {
  label: string;
  handle: string;
  href: string;
  Icon: IconType;
  external: boolean;
}

const LINKS: readonly ContactLink[] = [
  {
    label: "Email",
    handle: "shane.thakkar@gmail.com",
    href: "mailto:shane.thakkar@gmail.com",
    Icon: Mail,
    external: false,
  },
  {
    label: "LinkedIn",
    handle: "in/shanethakkar",
    href: "https://www.linkedin.com/in/shanethakkar",
    Icon: LinkedInLogo,
    external: true,
  },
  {
    label: "GitHub",
    handle: "@shanethakkar",
    href: "https://github.com/shanethakkar",
    Icon: GitHubLogo,
    external: true,
  },
];

/**
 * Contact section. Big editorial CTA on the left, four contact links on the
 * right rendered as small frosted cards. Resume PDF download sits below the
 * CTA as a secondary action.
 *
 * Stagger animation on viewport entry: CTA first, then each contact card.
 */
export function ContactSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14"
    >
      {/* CTA side */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="flex flex-col gap-6"
      >
        <h3 className="text-[clamp(36px,5vw,52px)] font-medium leading-[1.05] tracking-[-0.025em] text-fg-bright">
          Open to the next{" "}
          <span className="text-accent-bright">problem worth solving.</span>
        </h3>
        <p className="max-w-xl text-[16px] leading-[1.6] text-fg-muted">
          Exploring full-time roles in analytics, ML, data science, and BI.
          Always happy to connect about projects, ideas, or interesting
          problems.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <a
            href="mailto:shane.thakkar@gmail.com"
            className="group inline-flex items-center gap-2 rounded-full border border-accent-border bg-accent-soft px-4 py-2.5 font-mono text-[12px] tracking-[0.14em] text-accent-bright transition-all hover:border-accent hover:bg-accent/10"
          >
            <Mail size={14} strokeWidth={2} />
            <span>get in touch</span>
            <ArrowUpRight
              size={13}
              strokeWidth={2}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
          <a
            href="/Shane-Thakkar-Resume-May-2026.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.02] px-4 py-2.5 font-mono text-[12px] tracking-[0.14em] text-fg-muted transition-all hover:border-fg-muted hover:text-fg-bright"
          >
            <ArrowDownToLine
              size={13}
              strokeWidth={2}
              className="transition-transform group-hover:translate-y-0.5"
            />
            <span>resume.pdf</span>
          </a>
        </div>
      </motion.div>

      {/* Links side — stack one per row so handles never truncate */}
      <div className="flex flex-col gap-2.5">
        {LINKS.map((link, i) => (
          <ContactCard
            key={link.label}
            link={link}
            index={i}
            active={inView}
          />
        ))}
      </div>
    </div>
  );
}

function ContactCard({
  link,
  index,
  active,
}: {
  link: ContactLink;
  index: number;
  active: boolean;
}) {
  const { Icon, label, handle, href, external } = link;
  return (
    <motion.a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      initial={{ opacity: 0, y: 12 }}
      animate={active ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: 0.2 + index * 0.07,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className="liquid-glass group flex items-center gap-4 rounded-xl p-4 sm:p-5"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-white/[0.025] text-fg-muted transition-colors group-hover:border-accent-border group-hover:bg-accent-soft group-hover:text-accent-bright">
        <Icon size={15} strokeWidth={1.75} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-dim">
          {label}
        </span>
        <span className="font-mono text-[13.5px] tracking-[0.01em] text-fg transition-colors group-hover:text-fg-bright">
          {handle}
        </span>
      </div>
      <ArrowUpRight
        size={15}
        strokeWidth={1.75}
        className="flex-shrink-0 text-fg-dim transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-bright"
      />
    </motion.a>
  );
}
