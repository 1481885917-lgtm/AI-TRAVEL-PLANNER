import type { AgentContext } from "@/lib/types";
import { getFoodSpots } from "@/lib/providers/travel-apis";

export async function foodAgent(context: AgentContext): Promise<AgentContext> {
  const food = await getFoodSpots(context.cities);
  return { ...context, food };
}
