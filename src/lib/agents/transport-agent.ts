import type { AgentContext } from "@/lib/types";
import { getTransportOptions } from "@/lib/providers/travel-apis";

export async function transportAgent(context: AgentContext): Promise<AgentContext> {
  const transports = await getTransportOptions(context.cities, context.input.departDate);
  return { ...context, transports };
}
