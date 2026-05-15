"use client";

import { motion, useInView } from "framer-motion";
import { ArrowDownToLine, ArrowUpRight, Mail } from "lucide-react";
import { useRef, type ComponentType } from "react";

type IconProps = { size?: number; strokeWidth?: number };
type IconType = ComponentType<IconProps>;

// Brand glyphs are inlined as SVG paths because lucide-react has removed
// platform-specific trademarked icons. Sized via the `size` prop, colored via
// `currentColor` so they pick up the parent text color in hover states.
function GitHubLogo({ size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function LinkedInLogo({ size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.268 2.37 4.268 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function XLogo({ size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

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
  {
    label: "Twitter / X",
    handle: "@shanethakkar",
    href: "https://x.com/shanethakkar",
    Icon: XLogo,
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
          Looking for full-time roles in analytics, data science, machine
          learning, and BI — based in Dallas, open to remote or hybrid.
          Always happy to talk through a project, a methodology question, or
          what the data actually says.
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
