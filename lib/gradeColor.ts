/**
 * Maps a 0–100 grade to a discrete tier color, matching the live
 * leaderboard at nfl-grades.shanethakkar.com.
 *
 * Tiers (Tailwind 400-weight palette):
 *   ≥ 90 → emerald-400  #34d399
 *   ≥ 80 → green-400    #4ade80
 *   ≥ 70 → lime-400     #a3e635
 *   ≥ 55 → yellow-400   #facc15
 *   ≥ 40 → orange-400   #fb923c
 *   <  40 → red-400     #f87171
 *
 * Tiered (not continuous) on purpose: the NFL Grades site uses these as
 * categorical bands and a player jumping from 89.9 to 90.0 should visibly
 * "promote" into emerald rather than smoothly drift in hue.
 */

interface GradeTier {
  min: number;
  hex: string;
  softRgba: string;
}

const GRADE_TIERS: readonly GradeTier[] = [
  { min: 90, hex: "#34d399", softRgba: "rgba(52, 211, 153, 0.18)" },
  { min: 80, hex: "#4ade80", softRgba: "rgba(74, 222, 128, 0.18)" },
  { min: 70, hex: "#a3e635", softRgba: "rgba(163, 230, 53, 0.18)" },
  { min: 55, hex: "#facc15", softRgba: "rgba(250, 204, 21, 0.18)" },
  { min: 40, hex: "#fb923c", softRgba: "rgba(251, 146, 60, 0.18)" },
  { min: -Infinity, hex: "#f87171", softRgba: "rgba(248, 113, 113, 0.18)" },
] as const;

function tierFor(grade: number): GradeTier {
  for (const tier of GRADE_TIERS) {
    if (grade >= tier.min) return tier;
  }
  return GRADE_TIERS[GRADE_TIERS.length - 1];
}

export function gradeColor(grade: number): string {
  return tierFor(grade).hex;
}

/**
 * Same tier, lower-opacity variant for tinted backgrounds.
 */
export function gradeColorSoft(grade: number): string {
  return tierFor(grade).softRgba;
}
