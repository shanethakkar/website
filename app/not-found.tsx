import Link from "next/link";
import { DotGrid } from "@/components/DotGrid";

export default function NotFound() {
  return (
    <>
      <DotGrid />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col items-start justify-center px-6 py-24 sm:px-8">
        <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-accent-border bg-accent-soft px-3.5 py-1.5 font-mono text-[10.5px] tracking-[0.14em] text-accent-bright">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          404 — PAGE NOT FOUND
        </div>

        <h1 className="text-[clamp(56px,9vw,96px)] font-medium leading-[0.95] tracking-[-0.035em] text-fg-bright">
          Lost the thread.
        </h1>

        <p className="mt-7 max-w-xl text-[19px] leading-[1.55] text-fg/85">
          The page you tried doesn&apos;t exist — maybe it moved, maybe it never
          shipped. The rest of the site is still here.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-5 font-mono text-[11.5px] tracking-[0.16em] text-bg transition-all hover:-translate-y-0.5 hover:bg-accent-bright"
          >
            ← BACK HOME
          </Link>
          <Link
            href="/#projects"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border-subtle bg-white/[0.05] px-4 font-mono text-[11.5px] tracking-[0.16em] text-fg-bright transition-all hover:-translate-y-0.5 hover:border-accent-border hover:bg-accent-soft hover:text-accent-bright"
          >
            READ THE WRITING
          </Link>
        </div>
      </main>
    </>
  );
}
