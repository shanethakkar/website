import { AboutSection } from "@/components/AboutSection";
import { ArticleCard } from "@/components/ArticleCard";
import { ContactSection } from "@/components/ContactSection";
import { DotGrid } from "@/components/DotGrid";
import { FlagshipCard } from "@/components/FlagshipCard";
import { GitHubLogo, LinkedInLogo } from "@/components/icons";
import { MorphingNav } from "@/components/MorphingNav";
import {
  F1Visual,
  FourthDownVisual,
  MLBVisual,
} from "@/components/projectVisuals";
import { SectionHeader } from "@/components/SectionHeader";
import { TechPhysics } from "@/components/TechPhysics";
import { ArrowDownToLine, Mail } from "lucide-react";

export default function Home() {
  return (
    <>
      <DotGrid />

      <main id="top" className="relative z-10">
        <MorphingNav />

        {/* Hero */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-20 sm:px-8 sm:pb-24 sm:pt-32">
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-accent-border bg-accent-soft px-3.5 py-1.5 font-mono text-[10.5px] tracking-[0.14em] text-accent-bright">
            <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            AVAILABLE — ACTIVELY INTERVIEWING
          </div>

          <h1 className="text-[clamp(56px,9vw,112px)] font-medium leading-[0.95] tracking-[-0.035em] text-fg-bright">
            Shane Thakkar
          </h1>

          <div className="mt-4 font-mono text-[12px] tracking-[0.22em] text-accent">
            DATA ANALYST · UT DALLAS '26
          </div>

          <p className="mt-7 max-w-2xl text-[19px] leading-[1.55] text-fg/85">
            I build projects that follow my curiosity.
          </p>

          {/* Hero quick-links: GitHub / LinkedIn / Email / Resume */}
          <div className="mt-6 flex items-center gap-2.5">
            <a
              href="https://github.com/shanethakkar"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              title="GitHub"
              className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-white/[0.05] text-fg-bright transition-all hover:-translate-y-0.5 hover:border-accent-border hover:bg-accent-soft hover:text-accent-bright"
            >
              <GitHubLogo size={15} />
            </a>
            <a
              href="https://www.linkedin.com/in/shanethakkar"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
              className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-white/[0.05] text-fg-bright transition-all hover:-translate-y-0.5 hover:border-accent-border hover:bg-accent-soft hover:text-accent-bright"
            >
              <LinkedInLogo size={15} />
            </a>
            <a
              href="mailto:shane.thakkar@gmail.com"
              aria-label="Email"
              title="shane.thakkar@gmail.com"
              className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-white/[0.05] text-fg-bright transition-all hover:-translate-y-0.5 hover:border-accent-border hover:bg-accent-soft hover:text-accent-bright"
            >
              <Mail size={15} strokeWidth={1.75} />
            </a>
            <a
              href="/Shane-Thakkar-Resume-May-2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download resume (PDF)"
              title="Download resume (PDF)"
              className="group inline-flex h-10 items-center gap-2 rounded-full border border-border-subtle bg-white/[0.05] px-4 font-mono text-[11.5px] tracking-[0.16em] text-fg-bright transition-all hover:-translate-y-0.5 hover:border-accent-border hover:bg-accent-soft hover:text-accent-bright"
            >
              <ArrowDownToLine size={13} strokeWidth={2} />
              RESUME
            </a>
          </div>
        </section>

        {/* / 01 — Selected work (shipped products only) */}
        <section
          id="work"
          className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-8 sm:px-8 sm:py-10"
        >
          <SectionHeader
            number="01"
            title="Selected work"
            meta="LIVE PRODUCT"
          />
          <FlagshipCard />
        </section>

        {/* / 02 — Projects (stacked editorial article cards) */}
        <section
          id="projects"
          className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-8 sm:px-8 sm:py-10"
        >
          <SectionHeader number="02" title="Projects" meta="03 PROJECTS" />

          <div className="flex flex-col gap-4">
            <ArticleCard
              index={0}
              slug="fourth-down"
              title="Fourth Down Is Still Football's Biggest Coaching Problem"
              dateLabel="APR 22 '26"
              category="NFL · WPA · XGBoost"
              description="107k decisions from 1999–2025, scored against historically optimal calls. Coaches still leave ~one free win on the table every year — and the conservative ones make most of their mistakes in the red zone."
              tags={["python", "nflfastR", "xgboost"]}
              visual={<FourthDownVisual />}
            />
            <ArticleCard
              index={1}
              slug="f1-bayesian-driver-rankings"
              title="Who Is Actually the Best F1 Driver?"
              subtitle="A Bayesian approach to separating skill from the car"
              dateLabel="APR 18 '26"
              category="F1 · Bayesian"
              description="A hierarchical model on 2014–2025 race data decomposes finishing position into driver effect, car effect, and DNF risk. The result reveals the Verstappen Paradox — and Hamilton at the top with 85% confidence."
              tags={["pymc", "fastf1", "python"]}
              visual={<F1Visual />}
            />
            <ArticleCard
              index={2}
              slug="mlb-pitcher-height-velocity"
              title="Why Height Doesn't Predict Velocity in Major League Baseball"
              dateLabel="MAY 13 '25"
              category="MLB · Regression"
              description="Physics says taller pitchers should throw harder. The data says they don't. The story is selection bias: by the time you reach MLB, the relationship that dominates youth ball has been compressed away by survival."
              tags={["python", "sklearn", "statcast"]}
              visual={<MLBVisual />}
            />
          </div>
        </section>

        {/* / 03 — Tech & skills (physics playground) */}
        <section
          id="tech"
          className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-8 sm:px-8 sm:py-10"
        >
          <SectionHeader number="03" title="Tech I work with" meta="STACK" />
          <TechPhysics />
        </section>

        {/* / 04 — About */}
        <section
          id="about"
          className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-8 sm:px-8 sm:py-10"
        >
          <SectionHeader number="04" title="About" meta="WHO" />
          <AboutSection />
        </section>

        {/* / 05 — Contact */}
        <section
          id="contact"
          className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-8 sm:px-8 sm:py-10"
        >
          <SectionHeader number="05" title="Get in touch" meta="LET'S TALK" />
          <ContactSection />
        </section>

        <footer className="border-t border-border-subtle">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 font-mono text-[10.5px] tracking-[0.14em] text-fg-dim sm:px-8">
            <span>© SHANE THAKKAR — {new Date().getFullYear()}</span>
            <span>BUILD · v0.10.1</span>
          </div>
        </footer>
      </main>
    </>
  );
}
