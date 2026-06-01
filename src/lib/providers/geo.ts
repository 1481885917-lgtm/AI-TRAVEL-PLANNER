import type { Coordinates, RouteStop } from "@/lib/types";

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
  const cached = knownCoordinates[city];
  if (cached) {
    return cached;
  }

  const token = process.env.MAPBOX_TOKEN ?? process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    return { lng: 116.4074 + city.length, lat: 31.2304 + city.length / 3 };
  }

  const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(city)}.json`);
  url.searchParams.set("access_token", token);
  url.searchParams.set("language", "zh");
  url.searchParams.set("limit", "1");

  const response = await fetch(url);
  if (!response.ok) {
    return { lng: 116.4074 + city.length, lat: 31.2304 + city.length / 3 };
  }

  const data = (await response.json()) as { features?: Array<{ center: [number, number] }> };
  const center = data.features?.[0]?.center;
  return center ? { lng: center[0], lat: center[1] } : { lng: 116.4074, lat: 39.9042 };
}

export async function buildRoute(cities: string[]): Promise<RouteStop[]> {
  return Promise.all(
    cities.map(async (city) => ({
      city,
      coordinates: await geocodeCity(city)
    }))
  );
}
