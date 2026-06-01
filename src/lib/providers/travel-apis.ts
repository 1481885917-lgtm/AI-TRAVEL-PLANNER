import type { Attraction, FoodSpot, Hotel, TransportOption, WeatherForecast, WebSearchResult } from "@/lib/types";
import { searchWeb } from "@/lib/providers/web-search";

export async function getWeatherForecasts(cities: string[], dates: string[]): Promise<WeatherForecast[]> {
  if (process.env.WEATHER_API_KEY) {
    // Replace this branch with QWeather/OpenWeather/AccuWeather integration.
  }

  const searchByCity = await searchForCities(cities, (city) => `${city} ${dates[0]} ${dates.at(-1)} 天气预报`);

  return cities.flatMap((city, cityIndex) =>
    dates.map((date, index) => {
      const result = searchByCity.get(city)?.[0];
      return {
        city,
        date,
        condition: inferWeather(result?.snippet) ?? ["晴", "多云", "小雨"][Math.abs(cityIndex + index) % 3],
        temperatureMin: 16 + ((cityIndex + index) % 8),
        temperatureMax: 24 + ((cityIndex + index) % 10),
        rainChance: [10, 25, 45][Math.abs(cityIndex + index) % 3],
        tips: result?.snippet
          ? `参考公开天气搜索结果：${trimText(result.snippet, 70)}`
          : "建议携带轻便外套，并根据降雨概率准备雨具。",
        source: result?.url
      };
    })
  );
}

export async function getTransportOptions(cities: string[], departDate: string): Promise<TransportOption[]> {
  if (process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET) {
    // Replace this branch with Amadeus flight search and train adapters.
  }

  const pairs = cities.slice(0, -1).map((city, index) => [city, cities[index + 1]] as const);
  const searchByPair = await Promise.all(
    pairs.map(async ([from, to]) => ({
      key: `${from}-${to}`,
      results: await searchWeb(`${from} 到 ${to} ${departDate} 交通 高铁 飞机 火车`, 4)
    }))
  );
  const resultMap = new Map(searchByPair.map((item) => [item.key, item.results]));

  return pairs.map(([city, next], index) => {
    const result = resultMap.get(`${city}-${next}`)?.[0];
    const mode = inferTransportMode(`${result?.title ?? ""} ${result?.snippet ?? ""}`) ?? (index % 3 === 0 ? "高铁" : index % 3 === 1 ? "飞机" : "火车");
    return {
      from: city,
      to: next,
      mode,
      duration: mode === "飞机" ? "2小时10分" : mode === "高铁" ? "4小时30分" : "7小时20分",
      price: mode === "飞机" ? 780 : mode === "高铁" ? 420 : 260,
      provider: result ? "公开网页搜索" : mode === "飞机" ? "航班 API / Amadeus fallback" : "铁路 API / fallback",
      departure: `${departDate} 09:00`,
      arrival: `${departDate} ${mode === "飞机" ? "11:10" : "13:30"}`,
      reason: result ? trimText(result.snippet || result.title, 90) : "适合当前距离和预算约束",
      source: result?.url
    };
  });
}

export async function getAttractions(cities: string[]): Promise<Attraction[]> {
  if (process.env.ATTRACTION_API_KEY) {
    // Replace this branch with POI/OTA attraction APIs.
  }

  const searchByCity = await searchForCities(cities, (city) => `${city} 必去景点 评分 门票 开放时间`);

  return cities.flatMap((city, cityIndex) => {
    const searched = searchByCity.get(city) ?? [];
    const derived = searched.slice(0, 3).map((result, index) => ({
      city,
      name: cleanPlaceName(result.title, city, ["景点", "旅游", "攻略"]) || `${city}${["城市地标", "历史街区", "自然观景点"][index]}`,
      rating: 4.5 + index * 0.1,
      ticketPrice: inferPrice(result.snippet) ?? [0, 60, 120][index],
      openHours: inferOpenHours(result.snippet) ?? (index === 0 ? "09:00-21:00" : "08:30-17:30"),
      durationHours: [2, 3, 4][index],
      tags: inferAttractionTags(result.title + result.snippet),
      coordinates: {
        lng: 116.4 + cityIndex + index / 10,
        lat: 31.2 + cityIndex / 3 + index / 10
      },
      source: result.url
    }));

    return ensureAttractionFallback(city, cityIndex, derived);
  });
}

export async function getHotels(cities: string[]): Promise<Hotel[]> {
  if (process.env.HOTEL_API_KEY) {
    // Replace this branch with hotel inventory APIs.
  }

  const searchByCity = await searchForCities(cities, (city) => `${city} 酒店 推荐 评分 价格 市中心`);

  return cities.flatMap((city) => {
    const searched = searchByCity.get(city) ?? [];
    const derived = searched.slice(0, 2).map((result, index) => ({
      city,
      name: cleanPlaceName(result.title, city, ["酒店", "住宿", "预订"]) || `${city}${["舒适型酒店", "精品酒店"][index]}`,
      rating: index === 0 ? 4.6 : 4.8,
      pricePerNight: inferPrice(result.snippet) ?? (index === 0 ? 420 : 680),
      distanceToCenterKm: index === 0 ? 2.1 : 0.8,
      address: `${city}市中心商圈`,
      source: result.url
    }));

    return derived.length > 0
      ? derived
      : ["舒适型酒店", "精品酒店"].map((type, index) => ({
          city,
          name: `${city}${type}`,
          rating: index === 0 ? 4.6 : 4.8,
          pricePerNight: index === 0 ? 420 : 680,
          distanceToCenterKm: index === 0 ? 2.1 : 0.8,
          address: `${city}市中心商圈`
        }));
  });
}

export async function getFoodSpots(cities: string[]): Promise<FoodSpot[]> {
  if (process.env.FOOD_API_KEY) {
    // Replace this branch with restaurant/review APIs.
  }

  const searchByCity = await searchForCities(cities, (city) => `${city} 美食 推荐 特色菜 人均消费`);

  return cities.flatMap((city) => {
    const searched = searchByCity.get(city) ?? [];
    const derived = searched.slice(0, 3).map((result, index) => ({
      city,
      name: cleanPlaceName(result.title, city, ["美食", "餐厅", "小吃", "推荐"]) || `${city}${["老字号餐厅", "本地小吃", "创意菜馆"][index]}`,
      cuisine: index === 0 ? "地方菜" : index === 1 ? "街头小吃" : "融合菜",
      signatureDish: inferDish(result.snippet) ?? (index === 0 ? "招牌地方菜" : index === 1 ? "特色面点" : "季节限定套餐"),
      averageCost: inferPrice(result.snippet) ?? [95, 35, 160][index],
      rating: [4.7, 4.5, 4.8][index],
      source: result.url
    }));

    return derived.length > 0
      ? derived
      : ["老字号餐厅", "本地小吃", "创意菜馆"].map((type, index) => ({
          city,
          name: `${city}${type}`,
          cuisine: index === 0 ? "地方菜" : index === 1 ? "街头小吃" : "融合菜",
          signatureDish: index === 0 ? "招牌地方菜" : index === 1 ? "特色面点" : "季节限定套餐",
          averageCost: [95, 35, 160][index],
          rating: [4.7, 4.5, 4.8][index]
        }));
  });
}

async function searchForCities(cities: string[], buildQuery: (city: string) => string) {
  const entries = await Promise.all(
    cities.map(async (city) => [city, await searchWeb(buildQuery(city), 5)] as const)
  );
  return new Map(entries);
}

function ensureAttractionFallback(city: string, cityIndex: number, derived: Attraction[]) {
  if (derived.length > 0) {
    return derived;
  }

  return ["城市地标", "历史街区", "自然观景点"].map((kind, index) => ({
    city,
    name: `${city}${kind}`,
    rating: 4.5 + index * 0.1,
    ticketPrice: [0, 60, 120][index],
    openHours: index === 0 ? "09:00-21:00" : "08:30-17:30",
    durationHours: [2, 3, 4][index],
    tags: index === 0 ? ["摄影", "休闲"] : index === 1 ? ["历史文化"] : ["自然风光"],
    coordinates: {
      lng: 116.4 + cityIndex + index / 10,
      lat: 31.2 + cityIndex / 3 + index / 10
    }
  }));
}

function cleanPlaceName(title: string, city: string, stopWords: string[]) {
  const text = title
    .split(/[-_|｜:：]/)[0]
    .replace(new RegExp(`^${city}`), city)
    .replace(/[【】\[\]（）()]/g, "")
    .trim();

  const cleaned = stopWords.reduce((value, word) => value.replace(new RegExp(`${word}.*$`), ""), text).trim();
  return cleaned.length >= 2 ? cleaned : "";
}

function inferWeather(text = "") {
  if (/雨|降水|阵雨/.test(text)) return "小雨";
  if (/阴|多云/.test(text)) return "多云";
  if (/晴|阳光/.test(text)) return "晴";
  return null;
}

function inferTransportMode(text = ""): TransportOption["mode"] | null {
  if (/航班|飞机|机场/.test(text)) return "飞机";
  if (/高铁|动车|G\d+|D\d+/.test(text)) return "高铁";
  if (/火车|列车|铁路/.test(text)) return "火车";
  if (/自驾/.test(text)) return "自驾";
  if (/巴士|大巴|客运/.test(text)) return "巴士";
  return null;
}

function inferAttractionTags(text = "") {
  const tags = [];
  if (/美食|夜市|小吃/.test(text)) tags.push("美食");
  if (/拍照|摄影|机位/.test(text)) tags.push("摄影");
  if (/山|湖|海|公园|自然|风景/.test(text)) tags.push("自然风光");
  if (/古|博物馆|历史|文化|遗址/.test(text)) tags.push("历史文化");
  if (/亲子|儿童|乐园/.test(text)) tags.push("亲子");
  if (/购物|商场|奥特莱斯/.test(text)) tags.push("购物");
  if (/休闲|度假|温泉/.test(text)) tags.push("休闲");
  return tags.length > 0 ? tags : ["摄影", "休闲"];
}

function inferPrice(text = "") {
  const match = text.match(/(?:￥|¥|人均|门票|价格|每晚|起价)\s*(\d{2,5})/);
  return match ? Number(match[1]) : null;
}

function inferOpenHours(text = "") {
  const match = text.match(/(\d{1,2}:\d{2})\s*[-~至]\s*(\d{1,2}:\d{2})/);
  return match ? `${match[1]}-${match[2]}` : null;
}

function inferDish(text = "") {
  const match = text.match(/(?:特色|推荐|招牌)(?:菜|美食)?[：:，,\s]*([^，。,.]{2,12})/);
  return match?.[1]?.trim() || null;
}

function trimText(text: string, maxLength: number) {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}
