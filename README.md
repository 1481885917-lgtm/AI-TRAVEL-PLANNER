# AI Travel Planner

Multi-agent travel planning app built with Next.js, Tailwind, shadcn-style UI, LangGraph, OpenAI API, Supabase, and Mapbox.

## Features

- User inputs origin, destination, optional via cities, dates, budget, travelers, and preferences.
- Agents cover transport, weather, attractions, hotels, food, budget, and schedule optimization.
- Route map visualization through Mapbox.
- PDF export from the generated plan.
- Supabase persistence when service credentials are configured.
- Mock fallback data keeps the app runnable before real API keys are added.

## Run

```bash
npm install
npm run dev
```

On Windows you can also double-click `start.bat` — it installs dependencies on first run, starts the dev server, and opens the browser.

Create `.env.local` from `.env.example` and fill keys as needed.

### API Keys

| Variable | Required | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | for real AI scheduling | Schedule optimization via OpenAI |
| `OPENAI_MODEL` | no | Defaults to `gpt-4.1-mini` |
| `OPENAI_BASE_URL` | no | Point at an OpenAI-compatible gateway; defaults to the official API |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | for the route map | Mapbox basemap and geocoding |
| `SUPABASE_*` | no | Persist generated plans |
| `WEATHER` / `AMADEUS` / `HOTEL` / `ATTRACTION` / `FOOD` keys | no | Replace fallback data with live vendor APIs |
| `SEARCH_API_KEY` | no | Defaults to DuckDuckGo Lite |

Every optional provider falls back to built-in mock data, so the app runs end to end with no keys at all. Web search calls time out after 5 seconds, so an unreachable search endpoint degrades to mock data instead of hanging.

## Real API Integration Points

- `src/lib/providers/openai.ts`: OpenAI model call for schedule optimization.
- `src/lib/providers/geo.ts`: Mapbox geocoding and public map token.
- `src/lib/providers/travel-apis.ts`: replace fallback weather, transport, attraction, hotel, and food data with vendor APIs.
- `src/lib/providers/web-search.ts`: generic web-search fallback when a vertical API key is missing.
- `src/lib/providers/supabase.ts`: server-side Supabase persistence.
- `src/lib/agents/*`: each domain agent is isolated and can be replaced or extended independently.

## Supabase Schema

Run `supabase/schema.sql` in your Supabase SQL editor.
