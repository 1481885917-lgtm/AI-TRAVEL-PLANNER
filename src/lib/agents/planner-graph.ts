import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { attractionAgent } from "@/lib/agents/attraction-agent";
import { budgetAgent } from "@/lib/agents/budget-agent";
import { foodAgent } from "@/lib/agents/food-agent";
import { hotelAgent } from "@/lib/agents/hotel-agent";
import { scheduleOptimizerAgent } from "@/lib/agents/schedule-optimizer-agent";
import { transportAgent } from "@/lib/agents/transport-agent";
import { weatherAgent } from "@/lib/agents/weather-agent";
import { buildRoute } from "@/lib/providers/geo";
import { getSupabaseAdmin } from "@/lib/providers/supabase";
import type { AgentContext, PlannerInput, TravelPlan } from "@/lib/types";

export async function createTravelPlan(input: PlannerInput): Promise<TravelPlan> {
  const cities = [input.origin, ...(input.viaCities ?? []), input.destination].filter(Boolean);
  const route = await buildRoute(cities);
  const initialContext: AgentContext = { input, cities, route };

  const PlannerState = Annotation.Root({
    input: Annotation<AgentContext["input"]>(),
    cities: Annotation<AgentContext["cities"]>(),
    route: Annotation<AgentContext["route"]>(),
    transports: Annotation<AgentContext["transports"]>(),
    weather: Annotation<AgentContext["weather"]>(),
    attractions: Annotation<AgentContext["attractions"]>(),
    hotels: Annotation<AgentContext["hotels"]>(),
    food: Annotation<AgentContext["food"]>(),
    days: Annotation<AgentContext["days"]>(),
    budget: Annotation<AgentContext["budget"]>(),
    notices: Annotation<AgentContext["notices"]>()
  });

  const graph = new StateGraph(PlannerState)
    .addNode("transportAgent", transportAgent)
    .addNode("weatherAgent", weatherAgent)
    .addNode("attractionAgent", attractionAgent)
    .addNode("hotelAgent", hotelAgent)
    .addNode("foodAgent", foodAgent)
    .addNode("budgetAgent", budgetAgent)
    .addNode("scheduleOptimizerAgent", scheduleOptimizerAgent)
    .addEdge(START, "transportAgent")
    .addEdge("transportAgent", "weatherAgent")
    .addEdge("weatherAgent", "attractionAgent")
    .addEdge("attractionAgent", "hotelAgent")
    .addEdge("hotelAgent", "foodAgent")
    .addEdge("foodAgent", "budgetAgent")
    .addEdge("budgetAgent", "scheduleOptimizerAgent")
    .addEdge("scheduleOptimizerAgent", END);

  const compiled = graph.compile();
  const context = await compiled.invoke(initialContext);

  const plan: TravelPlan = {
    input,
    route,
    transports: context.transports ?? [],
    hotels: context.hotels ?? [],
    attractions: context.attractions ?? [],
    food: context.food ?? [],
    weather: context.weather ?? [],
    days: context.days ?? [],
    budget: context.budget ?? {
      transport: 0,
      hotels: 0,
      attractions: 0,
      food: 0,
      localTransport: 0,
      buffer: 0,
      total: 0,
      perPerson: 0,
      withinBudget: true
    },
    notices: context.notices ?? [],
    generatedAt: new Date().toISOString()
  };

  await persistPlan(plan);
  return plan;
}

async function persistPlan(plan: TravelPlan) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return;
  }

  const { data, error } = await supabase
    .from("travel_plans")
    .insert({
      origin: plan.input.origin,
      destination: plan.input.destination,
      depart_date: plan.input.departDate,
      return_date: plan.input.returnDate,
      travelers: plan.input.travelers,
      total_budget: plan.input.totalBudget,
      preferences: plan.input.preferences,
      plan
    })
    .select("id")
    .single();

  if (!error && data?.id) {
    plan.id = data.id as string;
  }
}
