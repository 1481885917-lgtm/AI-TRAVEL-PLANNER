import type { AgentContext } from "@/lib/types";
import { getHotels } from "@/lib/providers/travel-apis";

export async function hotelAgent(context: AgentContext): Promise<AgentContext> {
  const hotels = await getHotels(context.cities);
  return { ...context, hotels };
}
