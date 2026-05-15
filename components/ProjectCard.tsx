"use client";

import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { useRef } from "react";

export type ProjectStatus = "active" | "published" | "in-dev";

interface ProjectCardProps {
  status: ProjectStatus;
  category: string;
  title: string;
  description: string;
  tags: string[];
  href: string;
  external?: boolean;
  visual: ReactNode;
  index: number;
}

const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: "Active",
  published: "Published",
  "in-dev": "In dev",
};

export function ProjectCard({
  status,
  category,
  title,
  description,
  tags,
  href,
  external,
  visual,
  index,
}: ProjectCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <motion.a
      ref={ref}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      whileHover={{ y: -3 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent-border sm:p-6"
    >
      {/* Visual / data preview */}
      <div className="mb-5 h-[88px] w-full overflow-hidden">{visual}</div>

      {/* Status + category line */}
      <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-fg-dim">
        <span className="flex items-center gap-2">
          <StatusDot status={status} />
          {STATUS_LABEL[status]}
        </span>
        <span>{category}</span>
      </div>

      {/* Title */}
      <h3 className="text-[16.5px] font-medium leading-[1.25] tracking-[-0.005em] text-fg-bright transition-colors group-hover:text-accent-bright">
        {title}
      </h3>

      {/* Description */}
      <p className="mt-2 text-[13px] leading-[1.55] text-fg-muted">
        {description}
      </p>

      {/* Tags */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-border-subtle bg-white/[0.025] px-1.5 py-0.5 font-mono text-[10px] text-fg-muted"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Hover arrow */}
      <ArrowUpRight
        size={14}
        strokeWidth={1.75}
        className="absolute right-5 top-5 text-fg-dim opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
      />
    </motion.a>
  );
}

function StatusDot({ status }: { status: ProjectStatus }) {
  const isLive = status === "active";
  const color = isLive ? "bg-accent" : status === "published" ? "bg-fg-muted" : "bg-amber-400";
  return (
    <span className="relative inline-flex h-1.5 w-1.5">
      {isLive && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50" />
      )}
      <span
        className={`relative inline-flex h-1.5 w-1.5 rounded-full ${color}`}
      />
    </span>
  );
}
