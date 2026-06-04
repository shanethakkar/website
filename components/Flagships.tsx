import { NflGradesCard } from "@/components/NflGradesCard";
import { VenueInsightsCard } from "@/components/VenueInsightsCard";

/**
 * The homepage "Selected work" section — the live, shipped products. Stacks
 * the flagship cards top to bottom: NFL Position Grades first, then Venue
 * Insights. Each card carries its own live preview and "Flagship — Live" chip.
 */
export function Flagships() {
  return (
    <div className="flex flex-col gap-4">
      <NflGradesCard />
      <VenueInsightsCard />
    </div>
  );
}
