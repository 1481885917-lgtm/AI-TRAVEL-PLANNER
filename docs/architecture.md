# Architecture

## Data Flow

1. `src/app/page.tsx` collects planner inputs and posts to `POST /api/plans`.
2. `src/app/api/plans/route.ts` validates input with Zod.
3. `src/lib/agents/planner-graph.ts` builds route coordinates and runs the LangGraph workflow.
4. Domain agents enrich the shared `AgentContext`.
5. `Schedule Optimizer Agent` calls OpenAI when `OPENAI_API_KEY` exists, otherwise uses deterministic fallback planning.
6. The completed `TravelPlan` is persisted to Supabase when service credentials exist.
7. The client renders itinerary, budget, hotels, transport, weather, recommendations, Mapbox route, and PDF export.

## Agents

- `transport-agent.ts`: city-to-city transport options.
- `weather-agent.ts`: date and city weather forecasts.
- `attraction-agent.ts`: preference-aware attraction ranking.
- `hotel-agent.ts`: hotel candidates.
- `food-agent.ts`: restaurants and local dishes.
- `budget-agent.ts`: daily and total budget estimates.
- `schedule-optimizer-agent.ts`: final itinerary optimization.

## Provider Adapters

All real API calls should live under `src/lib/providers`.

- Replace `getWeatherForecasts` with a weather API such as OpenWeather, QWeather, or AccuWeather.
- Replace `getTransportOptions` with flight/train providers such as Amadeus or a rail data adapter.
- Replace `getAttractions`, `getHotels`, and `getFoodSpots` with OTA, POI, or local review APIs.
- Keep provider outputs normalized to `src/lib/types.ts` so agents remain stable.

When a vertical API key is missing, `src/lib/providers/web-search.ts` provides a web-search fallback. It uses `SEARCH_API_ENDPOINT` + `SEARCH_API_KEY` when configured, otherwise it tries DuckDuckGo Lite public search. Search snippets are normalized into the same `WeatherForecast`, `TransportOption`, `Attraction`, `Hotel`, and `FoodSpot` types and passed into the schedule optimizer.

## Extension Pattern

To add a new agent:

1. Add output types in `src/lib/types.ts`.
2. Add a provider adapter in `src/lib/providers`.
3. Create `src/lib/agents/new-agent.ts`.
4. Register the node and edge in `src/lib/agents/planner-graph.ts`.
5. Render the new data in `src/components/planner/plan-results.tsx`.

This keeps API vendors replaceable without rewriting the planner UI or graph orchestration.
