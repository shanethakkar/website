import { NflGradesCard } from "@/components/NflGradesCard";

/**
 * The homepage "Selected work" section — the live, shipped product. Renders
 * the NFL Position Grades flagship card, which carries its own live preview
 * and "Flagship — Live" chip.
 */
export function Flagships() {
  return (
    <div className="flex flex-col gap-4">
      <NflGradesCard />
    </div>
  );
}
