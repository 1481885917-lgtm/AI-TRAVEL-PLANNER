import type { AgentContext } from "@/lib/types";
import { getWeatherForecasts } from "@/lib/providers/travel-apis";
import { tripDates } from "@/lib/utils";

export async function weatherAgent(context: AgentContext): Promise<AgentContext> {
  const weather = await getWeatherForecasts(
    context.cities,
    tripDates(context.input.departDate, context.input.returnDate)
  );

  return { ...context, weather };
}
