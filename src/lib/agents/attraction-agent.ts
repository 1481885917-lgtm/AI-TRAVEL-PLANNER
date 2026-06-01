import type { AgentContext, Preference } from "@/lib/types";
import { getAttractions } from "@/lib/providers/travel-apis";

export async function attractionAgent(context: AgentContext): Promise<AgentContext> {
  const allAttractions = await getAttractions(context.cities);
  const selectedTags = new Set(context.input.preferences);

  const attractions = allAttractions.sort((left, right) => {
    const leftMatch = left.tags.some((tag) => selectedTags.has(tag as Preference)) ? 1 : 0;
    const rightMatch = right.tags.some((tag) => selectedTags.has(tag as Preference)) ? 1 : 0;
    return rightMatch - leftMatch || right.rating - left.rating;
  });

  return { ...context, attractions };
}
