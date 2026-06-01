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

Create `.env.local` from `.env.example` and fill keys as needed.

## Real API Integration Points

- `src/lib/providers/openai.ts`: OpenAI model call for schedule optimization.
- `src/lib/providers/geo.ts`: Mapbox geocoding and public map token.
- `src/lib/providers/travel-apis.ts`: replace fallback weather, transport, attraction, hotel, and food data with vendor APIs.
- `src/lib/providers/web-search.ts`: generic web-search fallback when a vertical API key is missing.
- `src/lib/providers/supabase.ts`: server-side Supabase persistence.
- `src/lib/agents/*`: each domain agent is isolated and can be replaced or extended independently.

## Supabase Schema

Run `supabase/schema.sql` in your Supabase SQL editor.
