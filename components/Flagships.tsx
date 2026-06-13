import { NflGradesCard } from "@/components/NflGradesCard";
import { PromptDataCard } from "@/components/PromptDataCard";
import { VenueInsightsCard } from "@/components/VenueInsightsCard";

/**
 * The homepage "Selected work" section — the live, shipped products. Stacks
 * the flagship cards top to bottom: NFL Position Grades, then Prompt Data,
 * then Venue Insights. Each card carries its own live preview and
 * "Flagship — Live" chip.
 */
export function Flagships() {
  return (
    <div className="flex flex-col gap-4">
      <NflGradesCard />
      <PromptDataCard />
      <VenueInsightsCard />
    </div>
  );
}
