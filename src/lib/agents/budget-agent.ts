import type { AgentContext, BudgetSummary } from "@/lib/types";
import { tripNights } from "@/lib/utils";

export async function budgetAgent(context: AgentContext): Promise<AgentContext> {
  const travelers = context.input.travelers;
  const nights = tripNights(context.input.departDate, context.input.returnDate);
  const transport = (context.transports ?? []).reduce((sum, item) => sum + item.price * travelers, 0);
  const hotels = context.cities.reduce((sum, city) => {
    const hotel = context.hotels?.find((item) => item.city === city);
    return sum + (hotel?.pricePerNight ?? 450) * nights;
  }, 0);
  const attractions = (context.attractions ?? [])
    .slice(0, Math.max(3, nights * 2))
    .reduce((sum, item) => sum + item.ticketPrice * travelers, 0);
  const food = Math.max(1, nights + 1) * travelers * 180;
  const localTransport = Math.max(1, nights + 1) * travelers * 55;
  const subtotal = transport + hotels + attractions + food + localTransport;
  const buffer = Math.round(subtotal * 0.12);
  const total = subtotal + buffer;

  const budget: BudgetSummary = {
    transport,
    hotels,
    attractions,
    food,
    localTransport,
    buffer,
    total,
    perPerson: Math.round(total / travelers),
    withinBudget: total <= context.input.totalBudget
  };

  return { ...context, budget };
}
