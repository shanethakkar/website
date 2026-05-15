/**
 * Maps a 0–100 grade to a color along the green → yellow → orange → red
 * gradient used throughout nfl-grades.shanethakkar.com. Grade 100 = bright
 * green, ~75 = yellow, ~60 = orange, 50 = red. Values outside [50, 100] clamp.
 */
export function gradeColor(grade: number): string {
  const clamped = Math.max(50, Math.min(100, grade));
  // Hue ramps from 0 (red) at grade=50 to 130 (green) at grade=100.
  const hue = ((clamped - 50) / 50) * 130;
  return `hsl(${hue.toFixed(0)}, 78%, 56%)`;
}

/**
 * Same hue, dimmer + lower-saturation variant for filling backgrounds.
 */
export function gradeColorSoft(grade: number): string {
  const clamped = Math.max(50, Math.min(100, grade));
  const hue = ((clamped - 50) / 50) * 130;
  return `hsla(${hue.toFixed(0)}, 78%, 56%, 0.18)`;
}
