# AI Travel Planner

Multi-agent travel planning app built with Next.js, Tailwind, shadcn-style UI, LangGraph, OpenAI API, Supabase, and AMap (高德地图).

## Features

- User inputs origin, destination, optional via cities, dates, budget, travelers, and preferences.
- Agents cover transport, weather, attractions, hotels, food, budget, and schedule optimization.
- Route map visualization through 高德地图 JS API 2.0, with the city route drawn as a polyline.
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
| `OPENAI_MODEL` | no | Defaults to `gpt-4.1-mini`. gpt-5/o-series models are detected automatically and switched to `reasoning_effort: minimal` + `max_completion_tokens`, which is what keeps long JSON responses fast |
| `OPENAI_BASE_URL` | no | Point at an OpenAI-compatible gateway; defaults to the official API |
| `NEXT_PUBLIC_AMAP_KEY` | for the route map | 高德地图 JS API 2.0 Key。控制台创建 Key 时需同时勾选「Web服务」和「Web端(JS API)」 |
| `NEXT_PUBLIC_AMAP_SECURITY_CODE` | for the route map | 高德安全密钥(jscode)，同一 Key 页面生成，前端必须带上 |
| `SUPABASE_*` | no | Persist generated plans |
| `WEATHER` / `AMADEUS` / `HOTEL` / `ATTRACTION` / `FOOD` keys | no | Replace fallback data with live vendor APIs |
| `SEARCH_API_KEY` | no | Defaults to DuckDuckGo Lite |

Every optional provider falls back to built-in mock data, so the app runs end to end with no keys at all.

Timeouts keep a slow or unreachable provider from hanging the request: web search gives up after 3 seconds and the OpenAI call after 45 seconds, both degrading to the built-in plan. When that happens the response says so under 注意事项, so a fallback run is never mistaken for an AI-optimized one.

## Real API Integration Points

- `src/lib/providers/openai.ts`: OpenAI model call for schedule optimization.
- `src/lib/providers/geo.ts`: 高德地理编码（需 Key 勾选「Web服务」），未配置时回落到内置城市坐标表。
- `src/lib/providers/travel-apis.ts`: replace fallback weather, transport, attraction, hotel, and food data with vendor APIs.
- `src/lib/providers/web-search.ts`: generic web-search fallback when a vertical API key is missing.
- `src/lib/providers/supabase.ts`: server-side Supabase persistence.
- `src/lib/agents/*`: each domain agent is isolated and can be replaced or extended independently.

## Supabase Schema

Run `supabase/schema.sql` in your Supabase SQL editor.
