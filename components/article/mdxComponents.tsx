import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import { Figure } from "./Figure";
import { Interactive } from "./Interactive";
import { Callout } from "./Callout";
import { MlbHeightVelocityChart } from "./MlbHeightVelocityChart";
import { F1DriverRankings } from "./F1DriverRankings";
import { F1ConstructorHeatmap } from "./F1ConstructorHeatmap";

/**
 * Component map handed to `<MDXRemote>`.
 *
 * Plain HTML element styling (h2, p, blockquote, code, table…) is handled
 * by CSS via the `.article-body` selector — see `app/globals.css`. Keeping
 * it CSS-driven means there's one source of truth for type sizes and
 * spacing rather than dozens of tiny React wrappers. This map is only for
 * *custom* components Shane writes in MDX:
 *   - `<Figure>` / `<Interactive>` / `<Callout>` — generic primitives
 *   - article-specific native charts (e.g. `<MlbHeightVelocityChart />`)
 *
 * Article-specific entries here are scoped per article — there's no harm
 * in registering them globally since each MDX file only references the
 * components it uses.
 */
export const mdxComponents: MDXRemoteProps["components"] = {
  Figure,
  Interactive,
  Callout,
  MlbHeightVelocityChart,
  F1DriverRankings,
  F1ConstructorHeatmap,
};
