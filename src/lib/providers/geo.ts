import type { Coordinates, RouteStop } from "@/lib/types";

const GEO_TIMEOUT_MS = 5000;

const knownCoordinates: Record<string, Coordinates> = {
  北京: { lng: 116.4074, lat: 39.9042 },
  上海: { lng: 121.4737, lat: 31.2304 },
  广州: { lng: 113.2644, lat: 23.1291 },
  深圳: { lng: 114.0579, lat: 22.5431 },
  杭州: { lng: 120.1551, lat: 30.2741 },
  成都: { lng: 104.0665, lat: 30.5728 },
  重庆: { lng: 106.5516, lat: 29.563 },
  西安: { lng: 108.9398, lat: 34.3416 },
  南京: { lng: 118.7969, lat: 32.0603 },
  苏州: { lng: 120.5853, lat: 31.2989 },
  厦门: { lng: 118.0894, lat: 24.4798 },
  青岛: { lng: 120.3826, lat: 36.0671 },
  昆明: { lng: 102.8329, lat: 24.8801 },
  大理: { lng: 100.2676, lat: 25.6065 },
  丽江: { lng: 100.233, lat: 26.8721 },
  桂林: { lng: 110.2902, lat: 25.2736 },
  三亚: { lng: 109.5119, lat: 18.2528 }
};

export async function geocodeCity(city: string): Promise<Coordinates> {
  const fallback = knownCoordinates[city] ?? { lng: 116.4074 + city.length, lat: 31.2304 + city.length / 3 };

  // 高德一个 Key 只对应一个服务平台：「Web服务」用于服务端地理编码，
  // 「Web端(JS API)」用于前端地图。两者是独立的 Key，不能复用。
  const key = process.env.AMAP_KEY ?? process.env.NEXT_PUBLIC_AMAP_KEY;
  if (!key) {
    return fallback;
  }

  // 高德返回 GCJ-02 坐标，与高德底图完全一致，标记不会有偏移；
  // 内置表是 WGS84，仅作离线兜底。
  const url = new URL("https://restapi.amap.com/v3/geocode/geo");
  url.searchParams.set("key", key);
  url.searchParams.set("address", city);
  url.searchParams.set("output", "JSON");

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(GEO_TIMEOUT_MS) });
    if (!response.ok) {
      return fallback;
    }

    const data = (await response.json()) as {
      status?: string;
      geocodes?: Array<{ location?: string }>;
    };
    const location = data.status === "1" ? data.geocodes?.[0]?.location : undefined;
    if (!location) {
      return fallback;
    }

    const [lng, lat] = location.split(",").map(Number);
    return Number.isFinite(lng) && Number.isFinite(lat) ? { lng, lat } : fallback;
  } catch {
    return fallback;
  }
}

export async function buildRoute(cities: string[]): Promise<RouteStop[]> {
  return Promise.all(
    cities.map(async (city) => ({
      city,
      coordinates: await geocodeCity(city)
    }))
  );
}
