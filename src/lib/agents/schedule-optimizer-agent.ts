import type { AgentContext, DayPlan } from "@/lib/types";
import { generateJsonWithOpenAI } from "@/lib/providers/openai";
import { tripDates } from "@/lib/utils";

type AiSchedule = {
  days: Array<Pick<DayPlan, "day" | "date" | "city" | "title" | "morning" | "afternoon" | "evening" | "cityTransport" | "notes">>;
  notices: string[];
};

export async function scheduleOptimizerAgent(context: AgentContext): Promise<AgentContext> {
  const dates = tripDates(context.input.departDate, context.input.returnDate);
  const fallbackDays = dates.map((date, index) => {
    const city = context.cities[Math.min(context.cities.length - 1, Math.floor((index / dates.length) * context.cities.length))];
    const attractions = (context.attractions ?? []).filter((item) => item.city === city).slice(0, 2);
    const food = (context.food ?? []).filter((item) => item.city === city).slice(0, 2);
    const weather = context.weather?.find((item) => item.city === city && item.date === date);

    return {
      day: index + 1,
      date,
      city,
      title: `${city}深度体验`,
      weather,
      morning: attractions[0] ? `游览${attractions[0].name}，预留 ${attractions[0].durationHours} 小时。` : `抵达${city}并办理入住。`,
      afternoon: attractions[1] ? `前往${attractions[1].name}，结合偏好安排拍照和休闲时间。` : `在${city}市中心自由活动。`,
      evening: food[0] ? `晚餐推荐${food[0].name}，尝试${food[0].signatureDish}。` : "选择酒店周边餐厅，早点休息。",
      attractions,
      food,
      cityTransport: "优先使用地铁/网约车组合，跨区游览时避开早晚高峰。",
      estimatedBudget: Math.round((context.budget?.total ?? context.input.totalBudget) / dates.length),
      notes: weather?.rainChance && weather.rainChance > 35 ? ["当日有降雨概率，保留室内备选点。"] : ["热门景点建议提前预约。"]
    };
  });

  const fallback: AiSchedule = {
    days: fallbackDays.map(({ weather, attractions, food, estimatedBudget, ...day }) => day),
    notices: [
      "证件、充电器、常用药品和雨具建议随身携带。",
      "门票、酒店、交通价格会随日期变化，下单前需要二次确认。",
      "跨城交通建议预留至少 90 分钟进出站或机场时间。"
    ]
  };

  const ai = await generateJsonWithOpenAI<AiSchedule>(
    "你是专业旅行行程优化 Agent。只输出 JSON，字段必须包含 days 和 notices。",
    JSON.stringify({
      input: context.input,
      route: context.route,
      transports: context.transports,
      hotels: context.hotels,
      attractions: context.attractions,
      food: context.food,
      weather: context.weather,
      budget: context.budget,
      requirement: "按日期生成每日 morning/afternoon/evening/cityTransport/notes，兼顾预算、偏好、天气和路线顺序。"
    }),
    fallback
  );

  const days: DayPlan[] = fallbackDays.map((fallbackDay) => {
    const aiDay = ai.days.find((item) => item.day === fallbackDay.day) ?? fallbackDay;
    const city = aiDay.city || fallbackDay.city;
    return {
      ...fallbackDay,
      ...aiDay,
      city,
      weather: context.weather?.find((item) => item.city === city && item.date === fallbackDay.date),
      attractions: (context.attractions ?? []).filter((item) => item.city === city).slice(0, 2),
      food: (context.food ?? []).filter((item) => item.city === city).slice(0, 2),
      estimatedBudget: fallbackDay.estimatedBudget
    };
  });

  return {
    ...context,
    days,
    notices: ai.notices?.length ? ai.notices : fallback.notices
  };
}
